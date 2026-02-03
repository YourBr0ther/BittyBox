# BittyBox NFC Dots - Design Document

## Overview

Add NFC tag scanning ("Dots") to BittyBox so Roo can tap a physical toy/tag on a tablet and have music automatically start playing on her Google speaker via Home Assistant.

## User Experience

### For Roo (6 years old)
1. Opens BittyBox on tablet, sees magical "Tap your Dot!" screen
2. Taps an NFC Dot (sticker on a toy, card, etc.) to the tablet
3. Tablet says "Now playing Disney Songs!" in a friendly voice
4. Music starts on her bedroom speaker
5. Screen shows beautiful "Now Playing" with playlist art and animations
6. Taps Stop button when done, returns to waiting screen

### For Parents
1. Go to `/admin`, enter PIN
2. Tap "Add New Dot" → hold Dot to tablet → reads tag ID
3. Enter playlist name, paste YouTube Music URL, pick icon/color
4. Save. That Dot now triggers that playlist.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   NFC Dot   │────▶│  BittyBox   │────▶│ Home Assistant  │
│   (tag)     │     │  (tablet)   │     │ (REST API)      │
└─────────────┘     └──────┬──────┘     └────────┬────────┘
                           │                     │
                           ▼                     ▼
                    ┌─────────────┐     ┌─────────────────┐
                    │ NanoGPT TTS │     │ Google Speaker  │
                    │ (voice)     │     │ (YouTube Music) │
                    └─────────────┘     └─────────────────┘
```

### Data Flow
1. Web NFC API reads tag ID from Dot
2. BittyBox looks up tag ID in `/data/nfc-mappings.json`
3. If found: call Home Assistant + NanoGPT TTS in parallel
4. HA casts YouTube Music playlist to speaker
5. TTS plays "Now playing X!" through tablet speaker
6. UI transitions to Now Playing state

## Technical Details

### Web NFC API
- Only works in Chrome on Android
- Requires HTTPS (or localhost)
- User must grant permission on first scan
- Returns tag serial number as identifier

### Home Assistant Integration
- REST API endpoint: `POST /api/services/media_player/play_media`
- Auth: Long-lived access token in Authorization header
- Payload:
```json
{
  "entity_id": "media_player.kid_room_speaker",
  "media_content_id": "https://music.youtube.com/playlist?list=...",
  "media_content_type": "music"
}
```

### NanoGPT TTS
- Endpoint: `https://nano-gpt.com/api/v1/tts`
- Returns audio that plays through tablet speaker
- Pre-generate common phrases, cache dynamic ones

### Data Storage
- `/data/nfc-mappings.json` persisted via Docker volume
- Schema:
```json
{
  "mappings": [
    {
      "tagId": "04:A2:B3:C4:D5:E6:F7",
      "playlistName": "Disney Songs",
      "playlistUrl": "https://music.youtube.com/playlist?list=PLxyz",
      "icon": "castle",
      "color": "#FF69B4"
    }
  ]
}
```

## New Files

### API Routes
- `src/app/api/dots/route.ts` — CRUD for Dot mappings
- `src/app/api/play/route.ts` — Trigger HA playback
- `src/app/api/tts/route.ts` — Generate/fetch TTS audio
- `src/app/api/ha-status/route.ts` — Check HA connection

### Pages
- `src/app/page.tsx` — Redesign for NFC mode (waiting + now playing)
- `src/app/admin/page.tsx` — Dot mapping admin UI

### Components
- `src/components/NfcScanner.tsx` — Web NFC hook and UI
- `src/components/WaitingScreen.tsx` — "Tap your Dot!" animated screen
- `src/components/NowPlaying.tsx` — Currently playing display
- `src/components/AdminDotList.tsx` — List of configured Dots
- `src/components/AdminDotForm.tsx` — Add/edit Dot form

### Services
- `src/services/homeAssistantService.ts` — HA API client
- `src/services/nanoGptService.ts` — TTS API client
- `src/services/dotMappingService.ts` — Dot storage operations

## Environment Variables

```bash
# Home Assistant
HOME_ASSISTANT_URL=https://homeassistant.hiddencasa.com
HOME_ASSISTANT_TOKEN=eyJhbGci...
HOME_ASSISTANT_SPEAKER=media_player.kid_room_speaker

# NanoGPT
NANOGPT_API_KEY=sk-nano-...

# Admin
ADMIN_PIN=1234

# Existing
NEXT_PUBLIC_YOUTUBE_API_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://bittybox.hiddencasa.com
```

## UI Design Requirements

### Waiting Screen ("Tap your Dot!")
- Magical, sparkly, inviting
- Animated elements (floating music notes, sparkles, gentle pulsing)
- Large friendly text
- Pink/purple color scheme matching existing app
- Works in portrait orientation on tablet

### Now Playing Screen
- Big playlist artwork/icon
- Playlist name in large, friendly font
- Animated music visualizer or dancing elements
- Large Stop button
- Subtle sparkle/celebration animation on transition

### Admin Page
- Clean, functional (parent-facing)
- PIN entry gate
- List of Dots with icons and names
- Add/Edit modal with NFC scan prompt
- Test connection button
- Not as whimsical as kid UI, but still on-brand

### Error States
- Friendly illustrations, not scary
- "I don't know that Dot!" — prompt to add in admin
- "Can't reach the speaker" — try again message
- "This tablet can't read Dots" — Web NFC not supported

## V2 Features (Deferred)

- **Radio Mode / DJ Roo** (Issue #1) — TTS breaks between songs with jokes, facts, encouragement
- Multiple speaker support
- Scheduling / bedtime mode
- Parental listening history

## Deployment

- Docker image pushed to local registry (10.0.2.180:30500)
- k8s deployment in media namespace
- IngressRoute at bittybox.hiddencasa.com
- Longhorn PVC for `/data` (Dot mappings)
