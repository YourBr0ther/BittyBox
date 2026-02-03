# BittyBox

A kid-friendly NFC music player that lets children play their favorite playlists by tapping physical "Dots" (NFC tags) on an Android tablet. Integrates with Home Assistant to control smart speakers.

## Features

- **NFC Dots** - Tap an NFC tag to instantly play a playlist on your smart speaker
- **Kid-Friendly UI** - Colorful, animated interface designed for children ages 3-8
- **Home Assistant Integration** - Control any media player through Home Assistant
- **Voice Feedback** - Optional TTS announces what's playing (via NanoGPT)
- **Admin Panel** - PIN-protected settings for parents to configure Dots
- **PWA Support** - Install on tablets for a full-screen, app-like experience

## How It Works

1. Parent configures a "Dot" in the admin panel (scans NFC tag, assigns playlist)
2. Child taps the Dot on the tablet
3. Music starts playing on the configured smart speaker
4. Child sees a fun "Now Playing" screen with animations

## Requirements

- Android tablet with NFC and Chrome browser
- Home Assistant instance with a media player entity
- NFC tags (NTAG213/215/216 recommended)
- Docker or Kubernetes for deployment

## Quick Start

### Docker

```bash
docker run -d \
  -p 3000:3000 \
  -v bittybox-data:/data \
  -e HA_URL=http://your-home-assistant:8123 \
  -e HA_TOKEN=your-long-lived-access-token \
  -e HA_SPEAKER_ENTITY=media_player.living_room \
  -e NEXTAUTH_SECRET=$(openssl rand -base64 32) \
  -e NEXTAUTH_URL=http://localhost:3000 \
  --name bittybox \
  yourbr0ther/bittybox:latest
```

### Docker Compose

```yaml
services:
  bittybox:
    image: yourbr0ther/bittybox:latest
    ports:
      - "3000:3000"
    volumes:
      - bittybox-data:/data
    env_file: .env
    restart: unless-stopped

volumes:
  bittybox-data:
```

Create a `.env` file:

```bash
# Home Assistant
HA_URL=http://your-home-assistant:8123
HA_TOKEN=your-long-lived-access-token
HA_SPEAKER_ENTITY=media_player.living_room

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Optional: Google OAuth for YouTube features
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_YOUTUBE_API_KEY=your-youtube-api-key

# Optional: Voice feedback
NANO_GPT_API_KEY=your-nanogpt-api-key

# Admin PIN (default: 1234)
NEXT_PUBLIC_ADMIN_PIN=1234
```

## Configuration

### Home Assistant Setup

1. Generate a Long-Lived Access Token in Home Assistant:
   - Profile → Security → Long-Lived Access Tokens → Create Token

2. Find your speaker entity ID:
   - Developer Tools → States → Search for `media_player`

3. Ensure the media player supports `media_player.play_media` service

### Creating Dots

1. Visit `/admin` on your BittyBox instance
2. Enter the admin PIN (default: 1234)
3. Click "Add New Dot"
4. Tap "Scan Dot" and hold an NFC tag to the tablet
5. Enter playlist name and YouTube Music URL
6. Choose an icon and color
7. Save

### NFC Tag Tips

- Use NTAG213 (144 bytes), NTAG215 (504 bytes), or NTAG216 (888 bytes)
- Tags don't need to be pre-formatted
- Each tag has a unique serial number used for identification
- Blank tags work fine - BittyBox only reads the tag ID

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HA_URL` | Yes | Home Assistant URL (e.g., `http://10.0.2.180:8123`) |
| `HA_TOKEN` | Yes | Home Assistant Long-Lived Access Token |
| `HA_SPEAKER_ENTITY` | Yes | Media player entity ID (e.g., `media_player.living_room`) |
| `NEXTAUTH_SECRET` | Yes | Random secret for session encryption |
| `NEXTAUTH_URL` | Yes | Your app's public URL |
| `NEXT_PUBLIC_ADMIN_PIN` | No | Admin PIN (default: `1234`) |
| `NANO_GPT_API_KEY` | No | NanoGPT API key for TTS voice feedback |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `NEXT_PUBLIC_YOUTUBE_API_KEY` | No | YouTube Data API key |

## Kubernetes Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full Kubernetes/k3s deployment instructions including:
- PersistentVolumeClaim for NFC mappings
- Secret configuration
- Deployment with health checks
- Traefik IngressRoute

## Development

```bash
# Install dependencies
npm install

# Create .env.local with your config
cp .env.example .env.local

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main NFC scanning interface
│   ├── admin/page.tsx        # Admin panel with PIN gate
│   └── api/
│       ├── dots/             # CRUD for Dot mappings
│       ├── play/             # Trigger playback
│       ├── stop/             # Stop playback
│       └── tts/              # Text-to-speech
├── components/
│   ├── dots/                 # Kid-facing UI components
│   └── admin/                # Admin panel components
├── hooks/
│   └── useNfcScanner.ts      # Web NFC API hook
├── services/
│   ├── dotMappingService.ts  # NFC tag → playlist storage
│   ├── homeAssistantService.ts
│   └── nanoGptService.ts
└── types/
    └── dot.ts                # TypeScript definitions
```

## Troubleshooting

### "This tablet can't read Dots"
- Ensure you're using Chrome on Android
- Check that NFC is enabled in device settings
- The device must have NFC hardware

### "Can't reach the speaker"
- Verify `HA_URL` is accessible from the container
- Check `HA_TOKEN` is valid and not expired
- Confirm `HA_SPEAKER_ENTITY` exists in Home Assistant

### "Permission denied" errors
- Ensure the `/data` volume is writable
- For Kubernetes, add `fsGroup: 1001` to the pod security context

### NFC not scanning
- Web NFC requires HTTPS in production
- User must tap "Tap to Start" button first (browser permission requirement)
- Hold the tag steady for 1-2 seconds

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with custom kid-friendly theme
- **Web NFC API** - NFC tag reading (Chrome on Android)
- **Home Assistant REST API** - Smart speaker control
- **NanoGPT** - Text-to-speech for voice feedback

## License

MIT

## Acknowledgments

Built with love for little music lovers who deserve a simple, magical way to play their favorite songs.
