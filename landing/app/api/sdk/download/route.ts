import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { sdkStorage, createSDKPackageContent } from '@/lib/sdk-storage';

/**
 * Retrieve generated SDK for download
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sdkId = searchParams.get('sdkId');

    if (!sdkId) {
      return NextResponse.json(
        { error: 'Missing sdkId parameter' },
        { status: 400 }
      );
    }

    const sdk = sdkStorage.get(sdkId);
    if (!sdk) {
      return NextResponse.json(
        { error: 'SDK not found' },
        { status: 404 }
      );
    }

    // Create download content
    const downloadContent = createSDKPackageContent(sdk.files, sdk.projectName);

    // Return as file download
    return new NextResponse(downloadContent, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${sdk.projectName}-sdk.txt"`,
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('SDK download error:', error);
    return NextResponse.json(
      { error: 'Failed to download SDK' },
      { status: 500 }
    );
  }
}
