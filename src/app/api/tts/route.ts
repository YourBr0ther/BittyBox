// src/app/api/tts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { NanoGptService } from '@/services/nanoGptService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, phrase, playlistName } = body;

    const apiKey = process.env.NANOGPT_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'NanoGPT not configured' },
        { status: 500 }
      );
    }

    // Use pre-defined phrase or custom text
    let speechText = text;
    if (phrase && phrase in NanoGptService.phrases) {
      const phraseValue = NanoGptService.phrases[phrase as keyof typeof NanoGptService.phrases];
      speechText = typeof phraseValue === 'function'
        ? phraseValue(playlistName || '')
        : phraseValue;
    }

    if (!speechText) {
      return NextResponse.json(
        { error: 'Missing text or phrase' },
        { status: 400 }
      );
    }

    const audioDataUrl = await NanoGptService.generateSpeech(speechText, apiKey);

    return NextResponse.json({ audioUrl: audioDataUrl });
  } catch (error) {
    console.error('Error generating TTS:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate speech';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
