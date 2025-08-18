import { NextRequest, NextResponse } from "next/server";
import UndergradModel from "@/lib/models/undergraduate";
import connectDB from "@/utils/db";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get migration options from request body
    const body = await request.json();
    const { dryRun = false, batchSize = 100 } = body;

    console.log(`Starting undergraduate migration (dry run: ${dryRun})`);

    // Find all undergraduate documents that need migration
    const documentsToMigrate = await UndergradModel.find({
      $or: [
        { cvUrl: { $exists: false } },
        { resumeUrl: { $exists: false } },
        { skills: { $exists: false } },
        { cvUrl: null },
        { resumeUrl: null },
        { skills: null }
      ]
    }).select('_id index name cvUrl resumeUrl skills');

    const totalDocuments = documentsToMigrate.length;
    console.log(`Found ${totalDocuments} documents that need migration`);

    if (totalDocuments === 0) {
      return NextResponse.json({
        success: true,
        message: "No documents need migration",
        data: {
          totalProcessed: 0,
          updated: 0,
          errors: [],
          dryRun
        }
      }, { status: 200 });
    }

    if (dryRun) {
      // Return preview of what would be migrated
      const preview = documentsToMigrate.slice(0, 10).map(doc => ({
        id: doc._id,
        index: doc.index,
        name: doc.name,
        currentFields: {
          cvUrl: doc.cvUrl || 'missing',
          resumeUrl: doc.resumeUrl || 'missing',
          skills: doc.skills || 'missing'
        },
        willUpdate: {
          cvUrl: doc.cvUrl === undefined || doc.cvUrl === null ? 'will set to null' : 'no change',
          resumeUrl: doc.resumeUrl === undefined || doc.resumeUrl === null ? 'will set to null' : 'no change',
          skills: doc.skills === undefined || doc.skills === null ? 'will set to empty array' : 'no change'
        }
      }));

      return NextResponse.json({
        success: true,
        message: `Migration preview: ${totalDocuments} documents need migration`,
        data: {
          totalToProcess: totalDocuments,
          preview,
          showingFirst: Math.min(10, totalDocuments),
          dryRun: true
        }
      }, { status: 200 });
    }

    // Perform actual migration
    let updated = 0;
    let errors: any[] = [];
    const batches = Math.ceil(totalDocuments / batchSize);

    for (let batch = 0; batch < batches; batch++) {
      const start = batch * batchSize;
      const end = Math.min(start + batchSize, totalDocuments);
      const batchDocs = documentsToMigrate.slice(start, end);

      console.log(`Processing batch ${batch + 1}/${batches} (documents ${start + 1}-${end})`);

      // Process each document in the batch
      for (const doc of batchDocs) {
        try {
          const updateFields: any = {};
          let needsUpdate = false;

          // Check and set cvUrl if missing
          if (doc.cvUrl === undefined || doc.cvUrl === null) {
            updateFields.cvUrl = null;
            needsUpdate = true;
          }

          // Check and set resumeUrl if missing
          if (doc.resumeUrl === undefined || doc.resumeUrl === null) {
            updateFields.resumeUrl = null;
            needsUpdate = true;
          }

          // Check and set skills if missing
          if (doc.skills === undefined || doc.skills === null || !Array.isArray(doc.skills)) {
            updateFields.skills = [];
            needsUpdate = true;
          }

          if (needsUpdate) {
            await UndergradModel.findByIdAndUpdate(
              doc._id,
              { $set: updateFields },
              { runValidators: false } // Skip validation for migration
            );
            updated++;
          }

        } catch (error: any) {
          console.error(`Error migrating document ${doc._id}:`, error);
          errors.push({
            documentId: doc._id,
            index: doc.index,
            error: error.message
          });
        }
      }

      // Add a small delay between batches to prevent overwhelming the database
      if (batch < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Migration completed: ${updated} documents updated, ${errors.length} errors`);

    // Verify migration by checking if any documents still need migration
    const remainingDocuments = await UndergradModel.countDocuments({
      $or: [
        { cvUrl: { $exists: false } },
        { resumeUrl: { $exists: false } },
        { skills: { $exists: false } }
      ]
    });

    return NextResponse.json({
      success: true,
      message: `Migration completed successfully`,
      data: {
        totalProcessed: totalDocuments,
        updated,
        errors,
        remainingDocuments,
        dryRun: false,
        completedAt: new Date().toISOString()
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({
      success: false,
      message: "Migration failed",
      error: error.message
    }, { status: 500 });
  }
}

// Get migration status
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Count documents that need migration
    const documentsNeedingMigration = await UndergradModel.countDocuments({
      $or: [
        { cvUrl: { $exists: false } },
        { resumeUrl: { $exists: false } },
        { skills: { $exists: false } }
      ]
    });

    // Count total documents
    const totalDocuments = await UndergradModel.countDocuments();

    // Count documents with new fields properly set
    const migratedDocuments = await UndergradModel.countDocuments({
      cvUrl: { $exists: true },
      resumeUrl: { $exists: true },
      skills: { $exists: true, $type: "array" }
    });

    // Sample of documents that need migration (for preview)
    const sampleDocuments = await UndergradModel.find({
      $or: [
        { cvUrl: { $exists: false } },
        { resumeUrl: { $exists: false } },
        { skills: { $exists: false } }
      ]
    }).select('_id index name cvUrl resumeUrl skills').limit(5);

    return NextResponse.json({
      success: true,
      data: {
        totalDocuments,
        migratedDocuments,
        documentsNeedingMigration,
        migrationComplete: documentsNeedingMigration === 0,
        migrationProgress: totalDocuments > 0 ? (migratedDocuments / totalDocuments) * 100 : 100,
        sampleDocumentsNeedingMigration: sampleDocuments.map(doc => ({
          id: doc._id,
          index: doc.index,
          name: doc.name,
          missingFields: {
            cvUrl: !doc.hasOwnProperty('cvUrl') || doc.cvUrl === undefined,
            resumeUrl: !doc.hasOwnProperty('resumeUrl') || doc.resumeUrl === undefined,
            skills: !doc.hasOwnProperty('skills') || doc.skills === undefined || !Array.isArray(doc.skills)
          }
        })),
        checkedAt: new Date().toISOString()
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Migration status check error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to check migration status",
      error: error.message
    }, { status: 500 });
  }
}
