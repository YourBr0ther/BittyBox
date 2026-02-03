# NFC Dots Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add NFC tag scanning ("Dots") to BittyBox so Roo can tap a physical tag and have music play on her Google speaker via Home Assistant.

**Architecture:** Web NFC API reads tag IDs, BittyBox looks up the playlist mapping in a JSON file, calls Home Assistant REST API to cast YouTube Music to the speaker, and plays TTS feedback through the tablet via NanoGPT.

**Tech Stack:** Next.js 14, Web NFC API, Home Assistant REST API, NanoGPT TTS, Tailwind CSS, TypeScript

**UI Design:** Use `frontend-design` skill for kid-facing screens (waiting, now playing) to create a magical, sparkly experience for a 6-year-old named Roo.

---

## Task 1: Environment Configuration

**Files:**
- Modify: `src/utils/env.ts`
- Modify: `.env.example`
- Create: `.env.local` (update existing)

**Step 1: Add new environment variables to env.ts**

```typescript
// Add to src/utils/env.ts

export const env = {
  // Existing
  youtubeApiKey: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '',
  nextAuthSecret: process.env.NEXTAUTH_SECRET || '',
  nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',

  // New - Home Assistant
  homeAssistantUrl: process.env.HOME_ASSISTANT_URL || '',
  homeAssistantToken: process.env.HOME_ASSISTANT_TOKEN || '',
  homeAssistantSpeaker: process.env.HOME_ASSISTANT_SPEAKER || 'media_player.kid_room_speaker',

  // New - NanoGPT
  nanoGptApiKey: process.env.NANOGPT_API_KEY || '',

  // New - Admin
  adminPin: process.env.ADMIN_PIN || '1234',
};
```

**Step 2: Update .env.example**

```bash
# Existing
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Home Assistant
HOME_ASSISTANT_URL=https://homeassistant.hiddencasa.com
HOME_ASSISTANT_TOKEN=your_long_lived_token
HOME_ASSISTANT_SPEAKER=media_player.kid_room_speaker

# NanoGPT TTS
NANOGPT_API_KEY=your_nanogpt_api_key

# Admin
ADMIN_PIN=1234
```

**Step 3: Commit**

```bash
git add src/utils/env.ts .env.example
git commit -m "feat: add environment config for Home Assistant, NanoGPT, and admin PIN"
```

---

## Task 2: Dot Mapping Types and Storage Service

**Files:**
- Create: `src/types/dot.ts`
- Create: `src/services/dotMappingService.ts`

**Step 1: Create Dot types**

```typescript
// src/types/dot.ts

export interface DotMapping {
  tagId: string;
  playlistName: string;
  playlistUrl: string;
  icon: string;
  color: string;
  createdAt: string;
}

export interface DotMappingsData {
  mappings: DotMapping[];
}

export const DOT_ICONS = [
  'star', 'heart', 'music', 'sparkles', 'rainbow',
  'unicorn', 'castle', 'butterfly', 'flower', 'sun',
  'moon', 'cloud', 'cat', 'dog', 'bunny'
] as const;

export const DOT_COLORS = [
  '#FF6B9D', '#FFB5D4', '#FF3A7A', '#9D4EDD', '#7B2CBF',
  '#5A189A', '#FF85A1', '#FFC2D1', '#A855F7', '#EC4899'
] as const;

export type DotIcon = typeof DOT_ICONS[number];
export type DotColor = typeof DOT_COLORS[number];
```

**Step 2: Create Dot mapping service**

```typescript
// src/services/dotMappingService.ts

import { DotMapping, DotMappingsData } from '@/types/dot';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = process.env.NODE_ENV === 'production' ? '/data' : './data';
const MAPPINGS_FILE = path.join(DATA_DIR, 'nfc-mappings.json');

async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory may already exist
  }
}

async function readMappings(): Promise<DotMappingsData> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(MAPPINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet, return empty mappings
    return { mappings: [] };
  }
}

async function writeMappings(data: DotMappingsData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(MAPPINGS_FILE, JSON.stringify(data, null, 2));
}

export const DotMappingService = {
  async getAll(): Promise<DotMapping[]> {
    const data = await readMappings();
    return data.mappings;
  },

  async getByTagId(tagId: string): Promise<DotMapping | null> {
    const data = await readMappings();
    return data.mappings.find(m => m.tagId === tagId) || null;
  },

  async create(mapping: Omit<DotMapping, 'createdAt'>): Promise<DotMapping> {
    const data = await readMappings();

    // Check if tag already exists
    const existing = data.mappings.find(m => m.tagId === mapping.tagId);
    if (existing) {
      throw new Error('A Dot with this tag ID already exists');
    }

    const newMapping: DotMapping = {
      ...mapping,
      createdAt: new Date().toISOString(),
    };

    data.mappings.push(newMapping);
    await writeMappings(data);
    return newMapping;
  },

  async update(tagId: string, updates: Partial<Omit<DotMapping, 'tagId' | 'createdAt'>>): Promise<DotMapping> {
    const data = await readMappings();
    const index = data.mappings.findIndex(m => m.tagId === tagId);

    if (index === -1) {
      throw new Error('Dot not found');
    }

    data.mappings[index] = {
      ...data.mappings[index],
      ...updates,
    };

    await writeMappings(data);
    return data.mappings[index];
  },

  async delete(tagId: string): Promise<void> {
    const data = await readMappings();
    data.mappings = data.mappings.filter(m => m.tagId !== tagId);
    await writeMappings(data);
  },
};
```

**Step 3: Commit**

```bash
git add src/types/dot.ts src/services/dotMappingService.ts
git commit -m "feat: add Dot mapping types and file-based storage service"
```

---

## Task 3: Home Assistant Service

**Files:**
- Create: `src/services/homeAssistantService.ts`

**Step 1: Create Home Assistant service**

```typescript
// src/services/homeAssistantService.ts

interface HAServiceCallPayload {
  entity_id: string;
  media_content_id: string;
  media_content_type: string;
}

interface HAState {
  entity_id: string;
  state: string;
  attributes: {
    media_title?: string;
    media_artist?: string;
    media_content_id?: string;
    friendly_name?: string;
    [key: string]: unknown;
  };
}

export const HomeAssistantService = {
  async callService(
    domain: string,
    service: string,
    payload: HAServiceCallPayload,
    haUrl: string,
    haToken: string
  ): Promise<void> {
    const response = await fetch(`${haUrl}/api/services/${domain}/${service}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Home Assistant error: ${error}`);
    }
  },

  async playMedia(
    speakerEntityId: string,
    mediaUrl: string,
    haUrl: string,
    haToken: string
  ): Promise<void> {
    await this.callService(
      'media_player',
      'play_media',
      {
        entity_id: speakerEntityId,
        media_content_id: mediaUrl,
        media_content_type: 'music',
      },
      haUrl,
      haToken
    );
  },

  async stopMedia(
    speakerEntityId: string,
    haUrl: string,
    haToken: string
  ): Promise<void> {
    const response = await fetch(`${haUrl}/api/services/media_player/media_stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entity_id: speakerEntityId }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Home Assistant error: ${error}`);
    }
  },

  async getState(
    entityId: string,
    haUrl: string,
    haToken: string
  ): Promise<HAState> {
    const response = await fetch(`${haUrl}/api/states/${entityId}`, {
      headers: {
        'Authorization': `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Home Assistant error: ${error}`);
    }

    return response.json();
  },

  async checkConnection(haUrl: string, haToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${haUrl}/api/`, {
        headers: {
          'Authorization': `Bearer ${haToken}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};
```

**Step 2: Commit**

```bash
git add src/services/homeAssistantService.ts
git commit -m "feat: add Home Assistant REST API service"
```

---

## Task 4: NanoGPT TTS Service

**Files:**
- Create: `src/services/nanoGptService.ts`

**Step 1: Create NanoGPT TTS service**

```typescript
// src/services/nanoGptService.ts

interface TTSResponse {
  audioUrl: string;
}

export const NanoGptService = {
  async generateSpeech(
    text: string,
    apiKey: string,
    voice: string = 'nova' // friendly female voice
  ): Promise<string> {
    const response = await fetch('https://nano-gpt.com/api/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice,
        model: 'tts-1',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NanoGPT TTS error: ${error}`);
    }

    // NanoGPT returns audio as a blob/buffer
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    return `data:audio/mp3;base64,${base64Audio}`;
  },

  // Pre-defined phrases for common interactions
  phrases: {
    nowPlaying: (playlistName: string) => `Now playing ${playlistName}!`,
    unknownDot: "Hmm, I don't know that Dot yet!",
    error: "Oops, something went wrong. Try again!",
    stopped: "Bye bye!",
    welcome: "Hi Roo! Tap a Dot to play some music!",
  },
};
```

**Step 2: Commit**

```bash
git add src/services/nanoGptService.ts
git commit -m "feat: add NanoGPT TTS service for voice feedback"
```

---

## Task 5: API Routes for Dots CRUD

**Files:**
- Create: `src/app/api/dots/route.ts`
- Create: `src/app/api/dots/[tagId]/route.ts`

**Step 1: Create main dots API route (GET all, POST create)**

```typescript
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
```

**Step 2: Create single dot API route (GET, PUT, DELETE)**

```typescript
// src/app/api/dots/[tagId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DotMappingService } from '@/services/dotMappingService';

interface RouteParams {
  params: { tagId: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const tagId = decodeURIComponent(params.tagId);
    const mapping = await DotMappingService.getByTagId(tagId);

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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const tagId = decodeURIComponent(params.tagId);
    const body = await request.json();
    const { playlistName, playlistUrl, icon, color } = body;

    const mapping = await DotMappingService.update(tagId, {
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const tagId = decodeURIComponent(params.tagId);
    await DotMappingService.delete(tagId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dot:', error);
    return NextResponse.json(
      { error: 'Failed to delete dot' },
      { status: 500 }
    );
  }
}
```

**Step 3: Commit**

```bash
git add src/app/api/dots/
git commit -m "feat: add CRUD API routes for Dot mappings"
```

---

## Task 6: Play and TTS API Routes

**Files:**
- Create: `src/app/api/play/route.ts`
- Create: `src/app/api/tts/route.ts`
- Create: `src/app/api/ha-status/route.ts`

**Step 1: Create play API route**

```typescript
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
```

**Step 2: Create stop API route**

```typescript
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
```

**Step 3: Create TTS API route**

```typescript
// src/app/api/tts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { NanoGptService } from '@/services/nanoGptService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, phrase } = body;

    const apiKey = process.env.NANOGPT_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'NanoGPT not configured' },
        { status: 500 }
      );
    }

    // Use pre-defined phrase or custom text
    let speechText = text;
    if (phrase && NanoGptService.phrases[phrase as keyof typeof NanoGptService.phrases]) {
      const phraseFunc = NanoGptService.phrases[phrase as keyof typeof NanoGptService.phrases];
      speechText = typeof phraseFunc === 'function'
        ? phraseFunc(body.playlistName || '')
        : phraseFunc;
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
```

**Step 4: Create HA status API route**

```typescript
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
```

**Step 5: Commit**

```bash
git add src/app/api/play/ src/app/api/stop/ src/app/api/tts/ src/app/api/ha-status/
git commit -m "feat: add API routes for play, stop, TTS, and HA status"
```

---

## Task 7: NFC Scanner Hook

**Files:**
- Create: `src/hooks/useNfcScanner.ts`

**Step 1: Create Web NFC hook**

```typescript
// src/hooks/useNfcScanner.ts

'use client';

import { useState, useEffect, useCallback } from 'react';

interface NfcScanResult {
  tagId: string;
  timestamp: number;
}

interface UseNfcScannerReturn {
  isSupported: boolean;
  isScanning: boolean;
  lastScan: NfcScanResult | null;
  error: string | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
}

export function useNfcScanner(): UseNfcScannerReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<NfcScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  useEffect(() => {
    // Check if Web NFC is supported
    setIsSupported('NDEFReader' in window);
  }, []);

  const startScanning = useCallback(async () => {
    if (!isSupported) {
      setError('NFC is not supported on this device');
      return;
    }

    try {
      setError(null);
      const controller = new AbortController();
      setAbortController(controller);

      // @ts-expect-error - NDEFReader is not in TypeScript types yet
      const ndef = new NDEFReader();

      await ndef.scan({ signal: controller.signal });
      setIsScanning(true);

      ndef.addEventListener('reading', ({ serialNumber }: { serialNumber: string }) => {
        // Convert serial number to a readable format
        const tagId = serialNumber || 'unknown';
        setLastScan({
          tagId,
          timestamp: Date.now(),
        });
      });

      ndef.addEventListener('readingerror', () => {
        setError('Error reading NFC tag. Try again.');
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start NFC scanning';

      if (message.includes('permission')) {
        setError('Please allow NFC access to use Dots');
      } else {
        setError(message);
      }
      setIsScanning(false);
    }
  }, [isSupported]);

  const stopScanning = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsScanning(false);
  }, [abortController]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  return {
    isSupported,
    isScanning,
    lastScan,
    error,
    startScanning,
    stopScanning,
  };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useNfcScanner.ts
git commit -m "feat: add useNfcScanner hook for Web NFC API"
```

---

## Task 8: Kid-Facing UI Components (Use frontend-design skill)

**Files:**
- Create: `src/components/dots/WaitingScreen.tsx`
- Create: `src/components/dots/NowPlayingScreen.tsx`
- Create: `src/components/dots/SuccessAnimation.tsx`
- Create: `src/components/dots/ErrorScreen.tsx`

**Step 1: Use frontend-design skill**

> **IMPORTANT:** Invoke the `frontend-design` skill to create these components with a magical, sparkly, kid-friendly design for a 6-year-old named Roo. Pink/purple color scheme. Large touch targets. Animated sparkles, floating music notes, dancing elements.

The frontend-design skill should create:

1. **WaitingScreen** - "Tap your Dot!" with sparkles, floating music notes, gentle pulsing animations
2. **NowPlayingScreen** - Large playlist icon, playlist name, animated visualizer, big Stop button
3. **SuccessAnimation** - Burst of stars/confetti on successful scan
4. **ErrorScreen** - Friendly illustrations for "unknown dot" and "speaker sleeping" states

**Step 2: Commit after frontend-design completes**

```bash
git add src/components/dots/
git commit -m "feat: add magical kid-facing UI components for Dots"
```

---

## Task 9: Main Page Refactor for NFC Mode

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Refactor main page for NFC Dots mode**

> **Note:** This will integrate the components created by frontend-design skill in Task 8.

```typescript
// src/app/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNfcScanner } from '@/hooks/useNfcScanner';
import WaitingScreen from '@/components/dots/WaitingScreen';
import NowPlayingScreen from '@/components/dots/NowPlayingScreen';
import SuccessAnimation from '@/components/dots/SuccessAnimation';
import ErrorScreen from '@/components/dots/ErrorScreen';

type AppState = 'waiting' | 'scanning' | 'success' | 'playing' | 'error';

interface PlayingInfo {
  playlistName: string;
  icon: string;
  color: string;
}

interface ErrorInfo {
  type: 'unknown_dot' | 'speaker_offline' | 'nfc_unsupported' | 'generic';
  message: string;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('waiting');
  const [playingInfo, setPlayingInfo] = useState<PlayingInfo | null>(null);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { isSupported, isScanning, lastScan, error: nfcError, startScanning } = useNfcScanner();

  // Start scanning on mount
  useEffect(() => {
    if (isSupported && !isScanning) {
      startScanning();
    }
  }, [isSupported, isScanning, startScanning]);

  // Handle NFC not supported
  useEffect(() => {
    if (!isSupported && typeof window !== 'undefined') {
      setAppState('error');
      setErrorInfo({
        type: 'nfc_unsupported',
        message: "This tablet can't read Dots. Try using Chrome on an Android tablet!",
      });
    }
  }, [isSupported]);

  // Play TTS audio
  const playTTS = useCallback(async (phrase: string, playlistName?: string) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase, playlistName }),
      });

      if (response.ok) {
        const { audioUrl } = await response.json();
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
    }
  }, []);

  // Handle NFC scan
  useEffect(() => {
    if (!lastScan) return;

    const handleScan = async () => {
      try {
        // Call play API
        const response = await fetch('/api/play', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagId: lastScan.tagId }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            setAppState('error');
            setErrorInfo({
              type: 'unknown_dot',
              message: "I don't know that Dot yet!",
            });
            playTTS('unknownDot');
          } else {
            setAppState('error');
            setErrorInfo({
              type: 'speaker_offline',
              message: "Can't reach the speaker right now.",
            });
            playTTS('error');
          }
          return;
        }

        // Success! Show animation then playing screen
        setShowSuccess(true);
        setPlayingInfo({
          playlistName: data.mapping.playlistName,
          icon: data.mapping.icon,
          color: data.mapping.color,
        });

        // Play TTS
        playTTS('nowPlaying', data.mapping.playlistName);

        // After animation, show now playing
        setTimeout(() => {
          setShowSuccess(false);
          setAppState('playing');
        }, 2000);
      } catch (error) {
        console.error('Scan handling error:', error);
        setAppState('error');
        setErrorInfo({
          type: 'generic',
          message: 'Oops! Something went wrong.',
        });
        playTTS('error');
      }
    };

    handleScan();
  }, [lastScan, playTTS]);

  // Handle stop
  const handleStop = useCallback(async () => {
    try {
      await fetch('/api/stop', { method: 'POST' });
    } catch (error) {
      console.error('Stop error:', error);
    }
    setPlayingInfo(null);
    setAppState('waiting');
  }, []);

  // Handle dismiss error
  const handleDismissError = useCallback(() => {
    setErrorInfo(null);
    setAppState('waiting');
  }, []);

  // Render success animation overlay
  if (showSuccess && playingInfo) {
    return <SuccessAnimation playlistName={playingInfo.playlistName} />;
  }

  // Render based on state
  switch (appState) {
    case 'playing':
      return playingInfo ? (
        <NowPlayingScreen
          playlistName={playingInfo.playlistName}
          icon={playingInfo.icon}
          color={playingInfo.color}
          onStop={handleStop}
        />
      ) : null;

    case 'error':
      return errorInfo ? (
        <ErrorScreen
          type={errorInfo.type}
          message={errorInfo.message}
          onDismiss={handleDismissError}
        />
      ) : null;

    case 'waiting':
    default:
      return <WaitingScreen isScanning={isScanning} />;
  }
}
```

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: refactor main page for NFC Dots mode"
```

---

## Task 10: Admin Page

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/components/admin/PinGate.tsx`
- Create: `src/components/admin/DotList.tsx`
- Create: `src/components/admin/DotForm.tsx`

**Step 1: Create PIN gate component**

```typescript
// src/components/admin/PinGate.tsx

'use client';

import { useState } from 'react';

interface PinGateProps {
  onSuccess: () => void;
}

export default function PinGate({ onSuccess }: PinGateProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check PIN (stored in env, checked client-side for simplicity)
    // In production, you'd verify server-side
    if (pin === process.env.NEXT_PUBLIC_ADMIN_PIN || pin === '1234') {
      onSuccess();
    } else {
      setError('Wrong PIN');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-light to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
        <h1 className="text-2xl font-bold text-pink-dark mb-6 text-center">
          Grown-Up Settings
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
              Enter PIN
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 text-2xl text-center tracking-widest border-2 border-pink-secondary rounded-xl focus:border-pink-primary focus:outline-none"
              placeholder="••••"
              maxLength={6}
            />
          </div>

          {error && (
            <p className="text-red-500 text-center text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-pink-primary text-white rounded-xl font-semibold hover:bg-pink-dark transition-colors"
          >
            Enter
          </button>
        </form>

        <a
          href="/"
          className="block mt-6 text-center text-pink-dark hover:text-pink-primary text-sm"
        >
          ← Back to BittyBox
        </a>
      </div>
    </div>
  );
}
```

**Step 2: Create DotList component**

```typescript
// src/components/admin/DotList.tsx

'use client';

import { DotMapping, DOT_ICONS } from '@/types/dot';
import { FaTrash, FaEdit } from 'react-icons/fa';

interface DotListProps {
  dots: DotMapping[];
  onEdit: (dot: DotMapping) => void;
  onDelete: (tagId: string) => void;
}

const iconMap: Record<string, string> = {
  star: '⭐',
  heart: '💖',
  music: '🎵',
  sparkles: '✨',
  rainbow: '🌈',
  unicorn: '🦄',
  castle: '🏰',
  butterfly: '🦋',
  flower: '🌸',
  sun: '☀️',
  moon: '🌙',
  cloud: '☁️',
  cat: '🐱',
  dog: '🐶',
  bunny: '🐰',
};

export default function DotList({ dots, onEdit, onDelete }: DotListProps) {
  if (dots.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-xl mb-2">No Dots configured yet</p>
        <p className="text-sm">Add a new Dot to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {dots.map((dot) => (
        <div
          key={dot.tagId}
          className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border-2"
          style={{ borderColor: dot.color }}
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl" role="img" aria-label={dot.icon}>
              {iconMap[dot.icon] || '⭐'}
            </span>
            <div>
              <h3 className="font-semibold text-gray-800">{dot.playlistName}</h3>
              <p className="text-xs text-gray-400 font-mono">{dot.tagId}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(dot)}
              className="p-2 text-pink-primary hover:bg-pink-light rounded-lg transition-colors"
              aria-label="Edit"
            >
              <FaEdit size={18} />
            </button>
            <button
              onClick={() => onDelete(dot.tagId)}
              className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Delete"
            >
              <FaTrash size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 3: Create DotForm component**

```typescript
// src/components/admin/DotForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { DotMapping, DOT_ICONS, DOT_COLORS } from '@/types/dot';
import { useNfcScanner } from '@/hooks/useNfcScanner';

interface DotFormProps {
  existingDot?: DotMapping | null;
  onSave: (dot: Omit<DotMapping, 'createdAt'>) => void;
  onCancel: () => void;
}

const iconMap: Record<string, string> = {
  star: '⭐', heart: '💖', music: '🎵', sparkles: '✨', rainbow: '🌈',
  unicorn: '🦄', castle: '🏰', butterfly: '🦋', flower: '🌸', sun: '☀️',
  moon: '🌙', cloud: '☁️', cat: '🐱', dog: '🐶', bunny: '🐰',
};

export default function DotForm({ existingDot, onSave, onCancel }: DotFormProps) {
  const [tagId, setTagId] = useState(existingDot?.tagId || '');
  const [playlistName, setPlaylistName] = useState(existingDot?.playlistName || '');
  const [playlistUrl, setPlaylistUrl] = useState(existingDot?.playlistUrl || '');
  const [icon, setIcon] = useState(existingDot?.icon || 'star');
  const [color, setColor] = useState(existingDot?.color || '#FF6B9D');
  const [isScanning, setIsScanning] = useState(false);

  const { isSupported, lastScan, startScanning, stopScanning } = useNfcScanner();

  // Handle NFC scan for new dots
  useEffect(() => {
    if (lastScan && isScanning && !existingDot) {
      setTagId(lastScan.tagId);
      setIsScanning(false);
      stopScanning();
    }
  }, [lastScan, isScanning, existingDot, stopScanning]);

  const handleScanClick = () => {
    if (isScanning) {
      stopScanning();
      setIsScanning(false);
    } else {
      startScanning();
      setIsScanning(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ tagId, playlistName, playlistUrl, icon, color });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-pink-dark">
        {existingDot ? 'Edit Dot' : 'Add New Dot'}
      </h2>

      {/* Tag ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dot Tag ID
        </label>
        {existingDot ? (
          <p className="font-mono text-sm text-gray-500">{tagId}</p>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={tagId}
              onChange={(e) => setTagId(e.target.value)}
              placeholder="Tap a Dot or enter manually"
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-primary focus:outline-none font-mono text-sm"
              required
            />
            {isSupported && (
              <button
                type="button"
                onClick={handleScanClick}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isScanning
                    ? 'bg-pink-primary text-white animate-pulse'
                    : 'bg-pink-light text-pink-dark hover:bg-pink-secondary'
                }`}
              >
                {isScanning ? 'Scanning...' : 'Scan'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Playlist Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Playlist Name
        </label>
        <input
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          placeholder="Disney Songs"
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-primary focus:outline-none"
          required
        />
      </div>

      {/* Playlist URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          YouTube Music URL
        </label>
        <input
          type="url"
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          placeholder="https://music.youtube.com/playlist?list=..."
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-primary focus:outline-none text-sm"
          required
        />
      </div>

      {/* Icon Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Icon
        </label>
        <div className="flex flex-wrap gap-2">
          {DOT_ICONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`w-12 h-12 text-2xl rounded-lg transition-all ${
                icon === i
                  ? 'bg-pink-primary scale-110 shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {iconMap[i]}
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {DOT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-full transition-all ${
                color === c ? 'scale-110 ring-4 ring-offset-2 ring-pink-primary' : ''
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-pink-primary text-white rounded-xl font-medium hover:bg-pink-dark transition-colors"
        >
          Save Dot
        </button>
      </div>
    </form>
  );
}
```

**Step 4: Create Admin page**

```typescript
// src/app/admin/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { DotMapping } from '@/types/dot';
import PinGate from '@/components/admin/PinGate';
import DotList from '@/components/admin/DotList';
import DotForm from '@/components/admin/DotForm';
import { FaPlus, FaHome, FaSync } from 'react-icons/fa';

type AdminView = 'list' | 'add' | 'edit';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<AdminView>('list');
  const [dots, setDots] = useState<DotMapping[]>([]);
  const [editingDot, setEditingDot] = useState<DotMapping | null>(null);
  const [haStatus, setHaStatus] = useState<{ connected: boolean; speaker?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dots
  const fetchDots = useCallback(async () => {
    try {
      const response = await fetch('/api/dots');
      const data = await response.json();
      setDots(data.mappings || []);
    } catch (error) {
      console.error('Error fetching dots:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch HA status
  const fetchHaStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/ha-status');
      const data = await response.json();
      setHaStatus(data);
    } catch (error) {
      console.error('Error fetching HA status:', error);
      setHaStatus({ connected: false });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDots();
      fetchHaStatus();
    }
  }, [isAuthenticated, fetchDots, fetchHaStatus]);

  // Handle save dot
  const handleSave = async (dot: Omit<DotMapping, 'createdAt'>) => {
    try {
      const isEdit = editingDot !== null;
      const url = isEdit ? `/api/dots/${encodeURIComponent(dot.tagId)}` : '/api/dots';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dot),
      });

      if (response.ok) {
        await fetchDots();
        setView('list');
        setEditingDot(null);
      }
    } catch (error) {
      console.error('Error saving dot:', error);
    }
  };

  // Handle delete dot
  const handleDelete = async (tagId: string) => {
    if (!confirm('Delete this Dot?')) return;

    try {
      await fetch(`/api/dots/${encodeURIComponent(tagId)}`, {
        method: 'DELETE',
      });
      await fetchDots();
    } catch (error) {
      console.error('Error deleting dot:', error);
    }
  };

  // Handle edit
  const handleEdit = (dot: DotMapping) => {
    setEditingDot(dot);
    setView('edit');
  };

  if (!isAuthenticated) {
    return <PinGate onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-light to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-pink-dark">Dot Settings</h1>
          <a
            href="/"
            className="flex items-center gap-2 text-pink-primary hover:text-pink-dark transition-colors"
          >
            <FaHome /> Back
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* HA Status */}
        <div className={`mb-6 p-4 rounded-xl flex items-center justify-between ${
          haStatus?.connected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div>
            <p className={`font-medium ${haStatus?.connected ? 'text-green-700' : 'text-red-700'}`}>
              {haStatus?.connected ? '✓ Home Assistant connected' : '✗ Home Assistant offline'}
            </p>
            {haStatus?.speaker && (
              <p className="text-sm text-gray-600">Speaker: {haStatus.speaker}</p>
            )}
          </div>
          <button
            onClick={fetchHaStatus}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaSync />
          </button>
        </div>

        {/* View switching */}
        {view === 'list' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Your Dots ({dots.length})
              </h2>
              <button
                onClick={() => setView('add')}
                className="flex items-center gap-2 px-4 py-2 bg-pink-primary text-white rounded-xl font-medium hover:bg-pink-dark transition-colors"
              >
                <FaPlus /> Add Dot
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-pink-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <DotList dots={dots} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </>
        )}

        {(view === 'add' || view === 'edit') && (
          <DotForm
            existingDot={editingDot}
            onSave={handleSave}
            onCancel={() => {
              setView('list');
              setEditingDot(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add src/app/admin/ src/components/admin/
git commit -m "feat: add admin page with PIN gate, Dot list, and Dot form"
```

---

## Task 11: Update Dockerfile and Docker Compose

**Files:**
- Modify: `Dockerfile`
- Modify: `docker-compose.yml`

**Step 1: Update Dockerfile to create data directory**

Add after the `RUN mkdir .next` line:

```dockerfile
# Create data directory for NFC mappings
RUN mkdir -p /data
RUN chown nextjs:nodejs /data
```

**Step 2: Update docker-compose.yml with new env vars and volume**

```yaml
version: '3.8'

services:
  bittybox:
    image: yourbr0ther/bittybox:latest
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_YOUTUBE_API_KEY=${NEXT_PUBLIC_YOUTUBE_API_KEY}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}
      - HOME_ASSISTANT_URL=${HOME_ASSISTANT_URL}
      - HOME_ASSISTANT_TOKEN=${HOME_ASSISTANT_TOKEN}
      - HOME_ASSISTANT_SPEAKER=${HOME_ASSISTANT_SPEAKER:-media_player.kid_room_speaker}
      - NANOGPT_API_KEY=${NANOGPT_API_KEY}
      - ADMIN_PIN=${ADMIN_PIN:-1234}
      - NEXT_PUBLIC_ADMIN_PIN=${ADMIN_PIN:-1234}
    volumes:
      - bittybox-data:/data
    restart: unless-stopped

volumes:
  bittybox-data:
```

**Step 3: Commit**

```bash
git add Dockerfile docker-compose.yml
git commit -m "feat: update Docker config for NFC Dots data persistence"
```

---

## Task 12: k8s Manifests for Deployment

**Files:**
- Create: `k3s_setup/manifests/172-bittybox-pvc.yaml`
- Create: `k3s_setup/manifests/173-bittybox-secret.yaml`
- Create: `k3s_setup/manifests/174-bittybox-deployment.yaml`
- Create: `k3s_setup/manifests/175-bittybox-service.yaml`

> **Note:** These files go in the k3s_setup repo, not BittyBox. Update CLUSTER.md and IngressRoutes as well.

**Step 1: Create PVC**

```yaml
# manifests/172-bittybox-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: bittybox-data
  namespace: media
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: longhorn
  resources:
    requests:
      storage: 1Gi
```

**Step 2: Create Secret**

```yaml
# manifests/173-bittybox-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: bittybox-secrets
  namespace: media
type: Opaque
stringData:
  HOME_ASSISTANT_URL: "https://homeassistant.hiddencasa.com"
  HOME_ASSISTANT_TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI0ZjBhZTZlNmQ4ODU0ODFiODEyMzk0MzIwNjhjYjI0ZiIsImlhdCI6MTc3MDEyNzY0NCwiZXhwIjoyMDg1NDg3NjQ0fQ.eGp1nJByECOvQ3gQ3fRIGNUZ4Pr4u2pSa1mMACF38Tk"
  HOME_ASSISTANT_SPEAKER: "media_player.kid_room_speaker"
  NANOGPT_API_KEY: "sk-nano-28c664fc-755e-4c9b-9724-4a03298b8cfb"
  ADMIN_PIN: "1234"
  NEXTAUTH_SECRET: "bittybox-random-secret-change-me"
```

**Step 3: Create Deployment**

```yaml
# manifests/174-bittybox-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bittybox
  namespace: media
  labels:
    app: bittybox
spec:
  replicas: 1
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: bittybox
  template:
    metadata:
      labels:
        app: bittybox
    spec:
      containers:
        - name: bittybox
          image: 10.0.2.180:30500/bittybox:latest
          ports:
            - containerPort: 3000
              protocol: TCP
          env:
            - name: HOME_ASSISTANT_URL
              valueFrom:
                secretKeyRef:
                  name: bittybox-secrets
                  key: HOME_ASSISTANT_URL
            - name: HOME_ASSISTANT_TOKEN
              valueFrom:
                secretKeyRef:
                  name: bittybox-secrets
                  key: HOME_ASSISTANT_TOKEN
            - name: HOME_ASSISTANT_SPEAKER
              valueFrom:
                secretKeyRef:
                  name: bittybox-secrets
                  key: HOME_ASSISTANT_SPEAKER
            - name: NANOGPT_API_KEY
              valueFrom:
                secretKeyRef:
                  name: bittybox-secrets
                  key: NANOGPT_API_KEY
            - name: ADMIN_PIN
              valueFrom:
                secretKeyRef:
                  name: bittybox-secrets
                  key: ADMIN_PIN
            - name: NEXT_PUBLIC_ADMIN_PIN
              valueFrom:
                secretKeyRef:
                  name: bittybox-secrets
                  key: ADMIN_PIN
            - name: NEXTAUTH_SECRET
              valueFrom:
                secretKeyRef:
                  name: bittybox-secrets
                  key: NEXTAUTH_SECRET
            - name: NEXTAUTH_URL
              value: "https://bittybox.hiddencasa.com"
          volumeMounts:
            - name: data
              mountPath: /data
          livenessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 30
            timeoutSeconds: 10
            failureThreshold: 3
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: bittybox-data
```

**Step 4: Create Service**

```yaml
# manifests/175-bittybox-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: bittybox
  namespace: media
spec:
  type: ClusterIP
  selector:
    app: bittybox
  ports:
    - name: web
      port: 3000
      targetPort: 3000
      protocol: TCP
```

**Step 5: Add IngressRoute to 139-ingressroutes.yaml**

Add in the "without auth" section:

```yaml
---
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: bittybox
  namespace: media
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(`bittybox.hiddencasa.com`)
      kind: Rule
      middlewares:
        - name: secure-headers
      services:
        - name: bittybox
          port: 3000
  tls:
    certResolver: letsencrypt
```

**Step 6: Update CLUSTER.md**

Add to Deployed Services table, Manifest Files section, and Ingress Routes (without auth).

**Step 7: Commit (in k3s_setup repo)**

```bash
git add manifests/172-bittybox-pvc.yaml manifests/173-bittybox-secret.yaml manifests/174-bittybox-deployment.yaml manifests/175-bittybox-service.yaml manifests/139-ingressroutes.yaml CLUSTER.md
git commit -m "feat: add BittyBox k8s manifests and IngressRoute"
```

---

## Task 13: Build and Push Docker Image

**Step 1: Build the image**

```bash
cd /Users/christophervance/projects/BittyBox
docker build -t 10.0.2.180:30500/bittybox:latest .
```

**Step 2: Push to local registry**

```bash
docker push 10.0.2.180:30500/bittybox:latest
```

**Step 3: Apply k8s manifests**

```bash
KUBECONFIG=~/.kube/k3s-config kubectl apply \
  -f /Users/christophervance/projects/k3s_setup/manifests/172-bittybox-pvc.yaml \
  -f /Users/christophervance/projects/k3s_setup/manifests/173-bittybox-secret.yaml \
  -f /Users/christophervance/projects/k3s_setup/manifests/174-bittybox-deployment.yaml \
  -f /Users/christophervance/projects/k3s_setup/manifests/175-bittybox-service.yaml \
  -f /Users/christophervance/projects/k3s_setup/manifests/139-ingressroutes.yaml
```

**Step 4: Verify deployment**

```bash
KUBECONFIG=~/.kube/k3s-config kubectl -n media get pods -l app=bittybox -o wide
KUBECONFIG=~/.kube/k3s-config kubectl -n media logs deploy/bittybox --tail=20
```

---

## Task 14: Create Cloudflare CNAME

**Manual step:** Create CNAME record in Cloudflare:
- Name: `bittybox`
- Target: `vance.duckdns.org`

---

## Task 15: Final Testing

1. Visit https://bittybox.hiddencasa.com on Android tablet with Chrome
2. Verify "Tap your Dot!" screen appears
3. Go to /admin, enter PIN
4. Add a test Dot mapping
5. Return to main screen, tap the NFC tag
6. Verify music plays on speaker and TTS speaks

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Environment configuration |
| 2 | Dot mapping types and storage service |
| 3 | Home Assistant service |
| 4 | NanoGPT TTS service |
| 5 | API routes for Dots CRUD |
| 6 | Play, stop, TTS, HA status API routes |
| 7 | NFC scanner hook |
| 8 | Kid-facing UI components (frontend-design skill) |
| 9 | Main page refactor |
| 10 | Admin page with PIN, list, form |
| 11 | Docker configuration |
| 12 | k8s manifests |
| 13 | Build and deploy |
| 14 | Cloudflare DNS |
| 15 | Final testing |
