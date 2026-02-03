// src/app/api/dots/[tagId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DotMappingService } from '@/services/dotMappingService';

interface RouteContext {
  params: Promise<{ tagId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { tagId } = await context.params;
    const decodedTagId = decodeURIComponent(tagId);
    const mapping = await DotMappingService.getByTagId(decodedTagId);

    if (!mapping) {
      return NextResponse.json(
        { error: 'Dot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ mapping });
  } catch (error) {
    console.error('Error fetching dot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dot' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { tagId } = await context.params;
    const decodedTagId = decodeURIComponent(tagId);
    const body = await request.json();
    const { playlistName, playlistUrl, icon, color } = body;

    const mapping = await DotMappingService.update(decodedTagId, {
      playlistName,
      playlistUrl,
      icon,
      color,
    });

    return NextResponse.json({ mapping });
  } catch (error) {
    console.error('Error updating dot:', error);
    const message = error instanceof Error ? error.message : 'Failed to update dot';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { tagId } = await context.params;
    const decodedTagId = decodeURIComponent(tagId);
    await DotMappingService.delete(decodedTagId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dot:', error);
    return NextResponse.json(
      { error: 'Failed to delete dot' },
      { status: 500 }
    );
  }
}
