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
      // URL format: https://67ed7bdab3fd8706347809322d8ffbf0.r2.cloudflarestorage.com/careerly/folder/filename
      const url = new URL(fileUrl);
      // Remove the leading slash and bucket name from pathname
      // pathname will be "/careerly/docs/filename.png"
      const pathParts = url.pathname.split('/').filter(part => part !== '');
      // Remove bucket name (first part) and join the rest
      const rawPath = pathParts.slice(1).join('/');
      // Decode URL-encoded characters (like %20 for spaces)
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
      // Extract filename from path
      const fileName = extractedPath.split('/').pop() || 'download';
      
      return new NextResponse(new Uint8Array(downloadResult.fileBuffer), {
        status: 200,
        headers: {
          'Content-Type': downloadResult.contentType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': downloadResult.fileBuffer.length.toString(),
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        message: downloadResult.message,
        error: downloadResult.error
      }, { status: 404 });
    }

  } catch (error: any) {
    console.error("Download endpoint error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, path } = body;

    if (!url && !path) {
      return NextResponse.json(
        { success: false, message: "No file URL or path provided" },
        { status: 400 }
      );
    }

    let extractedPath: string;

    if (url) {
      // Extract file path from URL
      const urlObj = new URL(url);
      // Remove the leading slash and bucket name from pathname
      const pathParts = urlObj.pathname.split('/').filter(part => part !== '');
      // Remove bucket name (first part) and join the rest
      const rawPath = pathParts.slice(1).join('/');
      // Decode URL-encoded characters (like %20 for spaces)
      extractedPath = decodeURIComponent(rawPath);
    } else {
      extractedPath = path;
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
      // Return as base64 for JSON response
      const base64Data = downloadResult.fileBuffer.toString('base64');
      const fileName = extractedPath.split('/').pop() || 'download';
      
      return NextResponse.json({
        success: true,
        message: "File downloaded successfully",
        data: {
          fileName: fileName,
          contentType: downloadResult.contentType,
          size: downloadResult.fileBuffer.length,
          base64Data: base64Data
        }
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: downloadResult.message,
        error: downloadResult.error
      }, { status: 404 });
    }

  } catch (error: any) {
    console.error("Download endpoint error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error.message
    }, { status: 500 });
  }
}