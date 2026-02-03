// src/app/api/dots/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DotMappingService } from '@/services/dotMappingService';

export async function GET() {
  try {
    const mappings = await DotMappingService.getAll();
    return NextResponse.json({ mappings });
  } catch (error) {
    console.error('Error fetching dots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tagId, playlistName, playlistUrl, icon, color } = body;

    if (!tagId || !playlistName || !playlistUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: tagId, playlistName, playlistUrl' },
        { status: 400 }
      );
    }

    const mapping = await DotMappingService.create({
      tagId,
      playlistName,
      playlistUrl,
      icon: icon || 'star',
      color: color || '#FF6B9D',
    });

    return NextResponse.json({ mapping }, { status: 201 });
  } catch (error) {
    console.error('Error creating dot:', error);
    const message = error instanceof Error ? error.message : 'Failed to create dot';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
