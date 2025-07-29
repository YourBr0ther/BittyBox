# BittyBox 🎵

[![Docker Pulls](https://img.shields.io/docker/pulls/yourbr0ther/bittybox)](https://hub.docker.com/r/yourbr0ther/bittybox)
[![Docker Image Size](https://img.shields.io/docker/image-size/yourbr0ther/bittybox/latest)](https://hub.docker.com/r/yourbr0ther/bittybox)
[![GitHub Actions](https://github.com/YourBr0ther/BittyBox/workflows/Build%20and%20Push%20Docker%20Image%20to%20Docker%20Hub/badge.svg)](https://github.com/YourBr0ther/BittyBox/actions)

A kid-friendly, touchscreen music player for YouTube playlists, designed specifically for young children. Features a beautiful, pink interface that makes playing music simple and fun!

## ✨ Features

- 🎨 **Child-friendly interface** with large, colorful buttons perfect for small hands
- 🎵 **YouTube integration** with support for playlists and individual videos
- 📱 **Progressive Web App (PWA)** - install on tablets and phones
- 🐳 **Docker ready** - deploy anywhere with one command
- 📑 **Flexible playlist management** via URLs or CSV import
- 🖼️ **Visual playlist selection** with custom icons and thumbnails
- 🔒 **Parent settings** with secure configuration options
- 🎯 **Touch-optimized** design for tablets and touchscreen devices
- 🌐 **Offline support** with service worker caching
- 🎮 **Simple controls** designed for ages 3-8

## 🚀 Quick Start

### Option 1: Docker (Recommended)

**Run immediately with Docker:**
```bash
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key \
  -e NEXTAUTH_SECRET=your_secret \
  --name bittybox \
  yourbr0ther/bittybox:latest
```

**Or use Docker Compose:**
```bash
git clone https://github.com/YourBr0ther/BittyBox.git
cd BittyBox
# Edit docker-compose.yml with your environment variables
docker-compose up -d
```

### Option 2: Traditional Setup

**Prerequisites:**
- Node.js 18+
- npm or yarn

**Installation:**
```bash
git clone https://github.com/YourBr0ther/BittyBox.git
cd BittyBox
npm install
```

**Environment Setup:**
Create `.env.local` with:
```bash
# Required
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000

# Optional (for Google OAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Run:**
```bash
npm run dev
# Visit http://localhost:3000
```

## 🐳 Docker Hub

BittyBox is available on Docker Hub with multi-architecture support:

- **Latest stable:** `yourbr0ther/bittybox:latest`
- **Specific version:** `yourbr0ther/bittybox:v1.0.0`
- **Platforms:** linux/amd64, linux/arm64

### Docker Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_YOUTUBE_API_KEY` | Yes | YouTube Data API v3 key |
| `NEXTAUTH_SECRET` | Yes | Random secret for session encryption |
| `NEXTAUTH_URL` | Yes | Your app's URL (e.g., http://localhost:3000) |
| `GOOGLE_CLIENT_ID` | No | For Google OAuth integration |
| `GOOGLE_CLIENT_SECRET` | No | For Google OAuth integration |

## 📱 Progressive Web App

BittyBox can be installed as a PWA on tablets and phones:

1. Visit the app in Chrome/Safari
2. Look for "Install" prompt or "Add to Home Screen"
3. Install for full-screen, app-like experience
4. Works offline with cached playlists

## 🎵 Setup Guide

### 1. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create API credentials (API Key)
5. Restrict the key to YouTube Data API v3

### 2. Configure Playlists

**Method 1: URL Import**
- Go to Settings → Playlists
- Paste YouTube playlist URL
- Click "Add Playlist"

**Method 2: CSV Import**
- Create CSV file: `name,url,icon`
- Example: `Kids Songs,https://youtube.com/playlist?list=ABC123,star`
- Import via Settings → Playlists → Import CSV

### 3. Optional: Google OAuth

For enhanced features (your personal playlists, ad-free with Premium):

1. Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://your-domain/api/auth/callback/google`
4. Add credentials to environment variables

## 🛠️ Development

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Docker Development
```bash
# Build local image
docker build -t bittybox-dev .

# Run with development setup
docker-compose -f docker-compose.dev.yml up
```

### Code Structure
```
src/
├── app/                 # Next.js 13+ app directory
│   ├── page.tsx        # Main player interface
│   └── settings/       # Parent settings
├── components/         # React components
│   ├── Player/         # Music player components
│   └── Playlists/      # Playlist management
├── services/           # API services
└── styles/             # Global styles
```

## 🚀 Deployment

### Docker Deployment

**Single Container:**
```bash
docker run -d \
  -p 80:3000 \
  -e NEXT_PUBLIC_YOUTUBE_API_KEY=your_key \
  -e NEXTAUTH_SECRET=your_secret \
  -e NEXTAUTH_URL=https://your-domain.com \
  --restart unless-stopped \
  yourbr0ther/bittybox:latest
```

**With Docker Compose:**
```yaml
version: '3.8'
services:
  bittybox:
    image: yourbr0ther/bittybox:latest
    ports:
      - "80:3000"
    environment:
      - NEXT_PUBLIC_YOUTUBE_API_KEY=your_key
      - NEXTAUTH_SECRET=your_secret
      - NEXTAUTH_URL=https://your-domain.com
    restart: unless-stopped
```

### Traditional Hosting

Deploy to Vercel, Netlify, or any Node.js hosting:
```bash
npm run build
npm start
```

## 📋 Features in Detail

### Child-Friendly Design
- Large, colorful buttons (minimum 60px touch targets)
- Simple navigation with visual cues
- Pink/purple color scheme appealing to children
- Minimal text, maximum visual elements
- Loading animations and feedback

### Playlist Management
- Support for YouTube playlist URLs
- CSV import for bulk playlist addition
- Custom icons for easy playlist identification
- Thumbnail preview for visual selection
- Local storage for offline access

### Safety Features
- No direct YouTube navigation
- Parent-controlled settings access
- No advertisements (with proper API setup)
- Secure authentication handling
- Private playlist support

## 🔧 Troubleshooting

### Common Issues

**"API key not working"**
- Ensure YouTube Data API v3 is enabled
- Check API key restrictions
- Verify quota limits

**"Playlists not loading"**
- Check network connectivity
- Verify API key permissions
- Check browser console for errors

**"Docker container won't start"**
- Verify environment variables are set
- Check port 3000 availability
- Review container logs: `docker logs bittybox`

**"OAuth not working"**
- Verify redirect URLs in Google Console
- Check NEXTAUTH_URL matches your domain
- Ensure NEXTAUTH_SECRET is set

### Getting Help

1. Check [Docker documentation](./DOCKER.md)
2. Review [GitHub Issues](https://github.com/YourBr0ther/BittyBox/issues)
3. Check container logs for errors
4. Verify all environment variables

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework for production
- **YouTube Data API** - Playlist and video data
- **Docker** - Containerization platform
- **Tailwind CSS** - Utility-first CSS framework
- **NextAuth.js** - Authentication solution
- **React Icons** - Beautiful icon library

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Custom themes and colors
- [ ] Parental controls and time limits
- [ ] Offline playlist download
- [ ] Voice commands
- [ ] Integration with Spotify/Apple Music

## 💖 Built with Love

Created specifically for young music lovers who deserve a safe, simple, and beautiful way to enjoy their favorite songs.

---

**Made with ❤️ for little music lovers everywhere**