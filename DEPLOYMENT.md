# BittyBox Deployment Guide

## Prerequisites
- Docker Hub account
- Kubernetes cluster (k3s) with Traefik and Longhorn
- kubectl configured with cluster access
- Domain with DNS managed (e.g., Cloudflare)

## 1. GitHub Repository Setup

### Set up Docker Hub Secrets
In your GitHub repository settings, add these secrets:
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub access token

### Push to Build
Push to the `main` branch to trigger the CI/CD workflow:
```bash
git push origin main
```

The workflow will build and push the image to `docker.io/<username>/bittybox:latest`.

## 2. Kubernetes Deployment

### Update Image Reference
Edit `manifests/176-bittybox-deployment.yaml` and replace `OWNER` with your Docker Hub username:
```yaml
image: docker.io/YOUR_DOCKER_USERNAME/bittybox:latest
```

### Configure Secrets
Edit `manifests/175-bittybox-secret.yaml` with your actual values:
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
- `NEXT_PUBLIC_YOUTUBE_API_KEY`: From Google Cloud Console
- `HA_TOKEN`: From Home Assistant (Long-Lived Access Token)
- `HA_URL`: Your Home Assistant URL
- `HA_SPEAKER_ENTITY`: Your speaker entity ID
- `NANO_GPT_API_KEY`: Your NanoGPT API key
- `NEXT_PUBLIC_ADMIN_PIN`: Change from default 1234

### Apply Manifests
```bash
KUBECONFIG=~/.kube/k3s-config kubectl apply -f manifests/174-bittybox-pvc.yaml
KUBECONFIG=~/.kube/k3s-config kubectl apply -f manifests/175-bittybox-secret.yaml
KUBECONFIG=~/.kube/k3s-config kubectl apply -f manifests/176-bittybox-deployment.yaml
KUBECONFIG=~/.kube/k3s-config kubectl apply -f manifests/177-bittybox-service.yaml
KUBECONFIG=~/.kube/k3s-config kubectl apply -f manifests/139-ingressroutes.yaml
```

### Verify Deployment
```bash
# Check pod status
KUBECONFIG=~/.kube/k3s-config kubectl -n media get pods -l app=bittybox

# Check logs
KUBECONFIG=~/.kube/k3s-config kubectl -n media logs -l app=bittybox --tail=50

# Check service
KUBECONFIG=~/.kube/k3s-config kubectl -n media get svc bittybox
```

## 3. DNS Configuration

Create a CNAME record in Cloudflare:
- **Name**: `bittybox`
- **Target**: `your-duckdns-domain.duckdns.org` (or your domain pointing to the cluster)
- **Proxy**: Disabled (DNS only) - let Traefik handle TLS

## 4. Verification

1. Visit https://bittybox.hiddencasa.com
2. Log in through Authelia
3. Test NFC scanning (requires Android with Chrome)
4. Test admin page at /admin
