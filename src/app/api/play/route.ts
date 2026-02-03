// src/app/api/play/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DotMappingService } from '@/services/dotMappingService';
import { HomeAssistantService } from '@/services/homeAssistantService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tagId } = body;

    if (!tagId) {
      return NextResponse.json(
        { error: 'Missing tagId' },
        { status: 400 }
      );
    }

    // Look up the dot mapping
    const mapping = await DotMappingService.getByTagId(tagId);

    if (!mapping) {
      return NextResponse.json(
        { error: 'Unknown dot', found: false },
        { status: 404 }
      );
    }

    // Get HA config from environment
    const haUrl = process.env.HOME_ASSISTANT_URL;
    const haToken = process.env.HOME_ASSISTANT_TOKEN;
    const speaker = process.env.HOME_ASSISTANT_SPEAKER || 'media_player.kid_room_speaker';

    if (!haUrl || !haToken) {
      return NextResponse.json(
        { error: 'Home Assistant not configured' },
        { status: 500 }
      );
    }

    // Play the media on the speaker
    await HomeAssistantService.playMedia(
      speaker,
      mapping.playlistUrl,
      haUrl,
      haToken
    );

    return NextResponse.json({
      success: true,
      mapping,
    });
  } catch (error) {
    console.error('Error playing media:', error);
    const message = error instanceof Error ? error.message : 'Failed to play media';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
