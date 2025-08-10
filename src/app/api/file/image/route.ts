import { NextRequest, NextResponse } from "next/server";
import { downloadFileFromR2 } from "@/utils/r2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("url");
    const filePath = searchParams.get("path");

    if (!fileUrl && !filePath) {
      return NextResponse.json(
        { success: false, message: "No file URL or path provided" },
        { status: 400 }
      );
    }

    let extractedPath: string;

    if (fileUrl) {
      // Extract file path from URL
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/').filter(part => part !== '');
      const rawPath = pathParts.slice(1).join('/');
      extractedPath = decodeURIComponent(rawPath);
    } else {
      extractedPath = filePath!;
    }

    if (!extractedPath) {
      return NextResponse.json(
        { success: false, message: "Invalid file path" },
        { status: 400 }
      );
    }

    // Download from R2
    const downloadResult = await downloadFileFromR2(extractedPath);

    if (downloadResult.success && downloadResult.fileBuffer) {
      // Return image directly with proper headers for browser display
      return new NextResponse(downloadResult.fileBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': downloadResult.contentType || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
          'Content-Length': downloadResult.fileBuffer.length.toString(),
        },
      });
    } else {
      // Return a default avatar or error image
      return NextResponse.json({
        success: false,
        message: downloadResult.message || "Image not found"
      }, { status: 404 });
    }

  } catch (error: any) {
    console.error("Image serving error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error.message
    }, { status: 500 });
  }
}
