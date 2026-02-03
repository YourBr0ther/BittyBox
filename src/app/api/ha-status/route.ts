// src/app/api/ha-status/route.ts

import { NextResponse } from 'next/server';
import { HomeAssistantService } from '@/services/homeAssistantService';

export async function GET() {
  try {
    const haUrl = process.env.HOME_ASSISTANT_URL;
    const haToken = process.env.HOME_ASSISTANT_TOKEN;
    const speaker = process.env.HOME_ASSISTANT_SPEAKER || 'media_player.kid_room_speaker';

    if (!haUrl || !haToken) {
      return NextResponse.json({
        connected: false,
        error: 'Home Assistant not configured',
      });
    }

    const connected = await HomeAssistantService.checkConnection(haUrl, haToken);

    if (!connected) {
      return NextResponse.json({
        connected: false,
        error: 'Cannot reach Home Assistant',
      });
    }

    // Get speaker state
    const state = await HomeAssistantService.getState(speaker, haUrl, haToken);

    return NextResponse.json({
      connected: true,
      speaker: {
        entityId: speaker,
        state: state.state,
        friendlyName: state.attributes.friendly_name,
        nowPlaying: state.attributes.media_title,
      },
    });
  } catch (error) {
    console.error('Error checking HA status:', error);
    return NextResponse.json({
      connected: false,
      error: 'Failed to check Home Assistant status',
    });
  }
}
