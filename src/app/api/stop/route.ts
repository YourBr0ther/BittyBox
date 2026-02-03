// src/app/api/stop/route.ts

import { NextResponse } from 'next/server';
import { HomeAssistantService } from '@/services/homeAssistantService';

export async function POST() {
  try {
    const haUrl = process.env.HOME_ASSISTANT_URL;
    const haToken = process.env.HOME_ASSISTANT_TOKEN;
    const speaker = process.env.HOME_ASSISTANT_SPEAKER || 'media_player.kid_room_speaker';

    if (!haUrl || !haToken) {
      return NextResponse.json(
        { error: 'Home Assistant not configured' },
        { status: 500 }
      );
    }

    await HomeAssistantService.stopMedia(speaker, haUrl, haToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error stopping media:', error);
    const message = error instanceof Error ? error.message : 'Failed to stop media';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
