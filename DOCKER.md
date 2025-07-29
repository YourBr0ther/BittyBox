# Docker Setup for BittyBox

This guide explains how to run BittyBox using Docker and deploy it to Docker Hub.

## 🐳 Quick Start with Docker

### Prerequisites
- Docker installed on your system
- Docker Compose (optional, for easier development)

### Environment Variables

Create a `.env.local` file with your configuration:

```bash
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (required for YouTube integration)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# YouTube Data API
NEXT_PUBLIC_YOUTUBE_API_KEY=your-youtube-api-key
```

## 🚀 Running with Docker

### Option 1: Using Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YourBr0ther/BittyBox.git
   cd BittyBox
   ```

2. **Update environment variables in docker-compose.yml:**
   Edit the environment section in `docker-compose.yml` with your actual values.

3. **Start the application:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   Open http://localhost:3000 in your browser

### Option 2: Using Docker directly

1. **Build the image:**
   ```bash
   docker build -t bittybox .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name bittybox-app \
     -p 3000:3000 \
     -e NEXTAUTH_URL=http://localhost:3000 \
     -e NEXTAUTH_SECRET=your-secret-key \
     -e GOOGLE_CLIENT_ID=your-google-client-id \
     -e GOOGLE_CLIENT_SECRET=your-google-client-secret \
     -e NEXT_PUBLIC_YOUTUBE_API_KEY=your-youtube-api-key \
     bittybox
   ```

## 📦 Docker Hub Deployment

### Automated Deployment (GitHub Actions)

The repository includes a GitHub Actions workflow that automatically builds and pushes images to Docker Hub when you push to the main branch or create tags.

#### Setup Steps:

1. **Create Docker Hub repository:**
   - Go to Docker Hub and create a new repository named `bittybox`

2. **Add GitHub Secrets:**
   Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password or access token

3. **Push to trigger build:**
   ```bash
   git push origin main
   ```

### Manual Deployment

1. **Login to Docker Hub:**
   ```bash
   docker login
   ```

2. **Build and tag the image:**
   ```bash
   docker build -t your-dockerhub-username/bittybox:latest .
   docker build -t your-dockerhub-username/bittybox:v1.0.0 .
   ```

3. **Push to Docker Hub:**
   ```bash
   docker push your-dockerhub-username/bittybox:latest
   docker push your-dockerhub-username/bittybox:v1.0.0
   ```

## 🔧 Docker Configuration

### Dockerfile Features
- Multi-stage build for optimized image size
- Non-root user for security
- Standalone Next.js output for container efficiency
- Health checks included
- Alpine Linux base for minimal footprint

### Docker Compose Features
- Port mapping (3000:3000)
- Environment variable configuration
- Volume mounting for persistent data
- Health checks
- Restart policies
- Optional Nginx reverse proxy setup

## 🛠️ Development

### Building for Development
```bash
# Build development image
docker build --target builder -t bittybox:dev .

# Run with volume mounting for live reload
docker run -p 3000:3000 -v $(pwd):/app bittybox:dev
```

### Debugging
```bash
# View logs
docker-compose logs -f bittybox

# Execute commands in running container
docker-compose exec bittybox sh

# Check container health
docker-compose ps
```

## 🚨 Production Considerations

### Security
- Use Docker secrets for sensitive environment variables
- Run containers with non-root user (already configured)
- Keep base images updated
- Use multi-stage builds to minimize attack surface

### Performance
- Configure proper resource limits
- Use health checks for container orchestration
- Consider using a reverse proxy (Nginx/Traefik)
- Enable container monitoring

### Scaling
```bash
# Scale with Docker Compose
docker-compose up -d --scale bittybox=3

# Use with orchestration platforms
# - Docker Swarm
# - Kubernetes
# - AWS ECS
# - Google Cloud Run
```

## 📋 Available Tags

- `latest`: Latest stable release from main branch
- `v1.0.0`, `v1.1.0`, etc.: Specific version releases
- `main`: Latest development build from main branch

## 🔍 Troubleshooting

### Common Issues

**Container fails to start:**
- Check environment variables are set correctly
- Verify port 3000 is not already in use
- Check Docker logs: `docker logs bittybox-app`

**Authentication issues:**
- Ensure NEXTAUTH_URL matches your domain
- Verify Google OAuth credentials are correct
- Check that redirect URLs are configured in Google Console

**YouTube API errors:**
- Verify YouTube Data API is enabled in Google Cloud Console
- Check API key has proper permissions
- Ensure API quota is not exceeded

### Getting Help
- Check container logs: `docker-compose logs bittybox`
- Verify environment variables: `docker-compose config`
- Test connectivity: `docker-compose exec bittybox wget -qO- http://localhost:3000`

## 📖 Additional Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)