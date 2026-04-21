import "dotenv/config";
import connect from "../src/utils/db";
import JobModel from "../src/lib/models/job";

type CustomSection = {
  title: string;
  bulletPoints: string[];
};

function parseSections(raw: string | undefined): CustomSection[] {
  if (!raw) return [];

  // Format:
  // "Responsibilities:Analyze data|Build reports;Benefits:Mentorship|Flexible hours"
  return raw
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [titlePart, bulletsPart = ""] = chunk.split(":");
      const title = titlePart?.trim() || "";
      const bulletPoints = bulletsPart
        .split("|")
        .map((point) => point.trim())
        .filter(Boolean);

      return { title, bulletPoints };
    })
    .filter((section) => section.title.length > 0);
}

async function main() {
  await connect();

  const command = process.argv[2];

  if (command === "init-missing") {
    const result = await JobModel.updateMany(
      { customSections: { $exists: false } },
      { $set: { customSections: [] } }
    );

    console.log("Initialized customSections for missing jobs:", {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
    process.exit(0);
  }

  if (command === "set-job") {
    const jobId = process.argv[3];
    const sectionsRaw = process.argv[4];

    if (!jobId || !sectionsRaw) {
      console.error(
        "Usage: npm run migrate-custom-sections -- set-job <jobId> \"Title:Point 1|Point 2;Title 2:Point A|Point B\""
      );
      process.exit(1);
    }

    const customSections = parseSections(sectionsRaw);
    const updated = await JobModel.findByIdAndUpdate(
      jobId,
      { $set: { customSections } },
      { new: true }
    );

    if (!updated) {
      console.error("Job not found for id:", jobId);
      process.exit(1);
    }

    console.log("Updated job customSections:", {
      jobId: updated._id.toString(),
      customSections: updated.customSections,
    });
    process.exit(0);
  }

  console.error(
    "Usage:\n  npm run migrate-custom-sections -- init-missing\n  npm run migrate-custom-sections -- set-job <jobId> \"Title:Point 1|Point 2;Title 2:Point A\""
  );
  process.exit(1);
}

main().catch((error) => {
  console.error("Migration error:", error);
  process.exit(1);
});
