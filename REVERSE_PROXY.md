# Running NoodleNook Behind Reverse Proxies

This guide covers how to deploy NoodleNook behind various popular reverse proxy solutions.

## Table of Contents

- [Nginx Reverse Proxy Manager](#nginx-reverse-proxy-manager)
- [Nginx Reverse Proxy](#nginx-reverse-proxy)
- [Traefik](#traefik)
- [Caddy](#caddy)

---

## Nginx Reverse Proxy Manager

[Nginx Proxy Manager](https://nginxproxymanager.com/) provides a simple web interface for managing Nginx reverse proxy configurations.

### Prerequisites

- Nginx Proxy Manager installed and running
- NoodleNook running on your network (e.g., `http://localhost:3000` or `http://your-server-ip:3000`)
- Domain name pointing to your server

### Setup Steps

1. **Log into Nginx Proxy Manager**
   - Access the web interface (typically at `http://your-server-ip:81`)
   - Default credentials: `admin@example.com` / `changeme`

2. **Create a New Proxy Host**
   - Click "Proxy Hosts" in the dashboard
   - Click "Add Proxy Host"

3. **Configure the Proxy Host**
   - **Domain Names**: Enter your domain (e.g., `wiki.yourdomain.com`)
   - **Scheme**: `http`
   - **Forward Hostname / IP**: Your NoodleNook server IP or hostname
   - **Forward Port**: `3000`
   - **Cache Assets**: Enable (optional, recommended for better performance)
   - **Block Common Exploits**: Enable (recommended)
   - **Websockets Support**: Enable (if using real-time features)

4. **SSL Configuration (Optional but Recommended)**
   - Click the "SSL" tab
   - Select "Request a new SSL Certificate"
   - Choose "Let's Encrypt"
   - Enter your email address
   - Enable "Force SSL" (redirects HTTP to HTTPS)
   - Enable "HTTP/2 Support"
   - Click "Save"

5. **Advanced Configuration (Optional)**
   - Click "Advanced" tab if you need custom Nginx configuration
   - Example custom config for WebSocket support:
   ```nginx
   proxy_set_header Upgrade $http_upgrade;
   proxy_set_header Connection "upgrade";
   proxy_set_header Host $host;
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header X-Forwarded-Proto $scheme;
   ```

6. **Test Your Configuration**
   - Visit your domain (e.g., `https://wiki.yourdomain.com`)
   - You should see the NoodleNook application

### Docker Compose Example

If you're running both NPM and NoodleNook in Docker:

```yaml
version: '3.8'

services:
  nginx-proxy-manager:
    image: 'jc21/nginx-proxy-manager:latest'
    ports:
      - '80:80'
      - '443:443'
      - '81:81'
    volumes:
      - ./npm-data:/data
      - ./letsencrypt:/etc/letsencrypt
    networks:
      - proxy

  noodlenook-frontend:
    # ... your NoodleNook frontend config
    networks:
      - proxy
      - default

  noodlenook-backend:
    # ... your NoodleNook backend config
    networks:
      - proxy
      - default

  postgres:
    # ... your PostgreSQL config
    networks:
      - default

networks:
  proxy:
    driver: bridge
  default:
    driver: bridge
```

---

## Nginx Reverse Proxy

For a traditional Nginx installation without the web UI.

### Prerequisites

- Nginx installed (`apt install nginx` on Ubuntu/Debian)
- NoodleNook running (e.g., `http://localhost:3000`)
- Domain name (optional, can use IP address)

### Configuration

1. **Create Nginx Configuration File**

Create `/etc/nginx/sites-available/noodlenook`:

```nginx
# HTTP server (redirects to HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name wiki.yourdomain.com;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name wiki.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/wiki.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wiki.yourdomain.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client body size (for file uploads)
    client_max_body_size 50M;

    # Proxy settings
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Optional: Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Access and error logs
    access_log /var/log/nginx/noodlenook_access.log;
    error_log /var/log/nginx/noodlenook_error.log;
}
```

2. **Enable the Site**

```bash
# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/noodlenook /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

3. **Setup SSL with Let's Encrypt (Optional)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d wiki.yourdomain.com

# Certbot will automatically configure SSL in your Nginx config
```

### Without SSL (HTTP Only)

If you don't need SSL, use this simpler configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name wiki.yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    access_log /var/log/nginx/noodlenook_access.log;
    error_log /var/log/nginx/noodlenook_error.log;
}
```

---

## Traefik

[Traefik](https://traefik.io/) is a modern HTTP reverse proxy and load balancer with automatic service discovery.

### Prerequisites

- Docker and Docker Compose installed
- Basic understanding of Traefik configuration

### Docker Compose Configuration

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    command:
      # Enable Dashboard
      - "--api.dashboard=true"
      # Docker provider
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      # Entrypoints
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      # Let's Encrypt configuration
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=your-email@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      # Redirect HTTP to HTTPS
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"
    labels:
      # Dashboard
      - "traefik.enable=true"
      - "traefik.http.routers.dashboard.rule=Host(`traefik.yourdomain.com`)"
      - "traefik.http.routers.dashboard.service=api@internal"
      - "traefik.http.routers.dashboard.entrypoints=websecure"
      - "traefik.http.routers.dashboard.tls.certresolver=letsencrypt"
    networks:
      - traefik

  frontend:
    build: ./frontend
    labels:
      - "traefik.enable=true"
      # HTTP Router
      - "traefik.http.routers.noodlenook.rule=Host(`wiki.yourdomain.com`)"
      - "traefik.http.routers.noodlenook.entrypoints=websecure"
      - "traefik.http.routers.noodlenook.tls.certresolver=letsencrypt"
      # Service
      - "traefik.http.services.noodlenook.loadbalancer.server.port=3000"
    networks:
      - traefik
      - backend
    depends_on:
      - backend

  backend:
    build: ./backend
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=noodlenook
      - DB_USER=noodlenook
      - DB_PASSWORD=noodlenook123
      - JWT_SECRET=your-secret-key-change-in-production
    networks:
      - backend
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=noodlenook
      - POSTGRES_USER=noodlenook
      - POSTGRES_PASSWORD=noodlenook123
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - backend

networks:
  traefik:
    driver: bridge
  backend:
    driver: bridge

volumes:
  postgres-data:
```

### Key Traefik Labels Explained

- `traefik.enable=true`: Enables Traefik for this service
- `traefik.http.routers.noodlenook.rule=Host(...)`: Matches requests by domain
- `traefik.http.routers.noodlenook.entrypoints=websecure`: Uses HTTPS entrypoint
- `traefik.http.routers.noodlenook.tls.certresolver=letsencrypt`: Automatic SSL with Let's Encrypt
- `traefik.http.services.noodlenook.loadbalancer.server.port=3000`: Internal service port

### Advanced Traefik Configuration

For middleware (rate limiting, authentication, etc.):

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.noodlenook.rule=Host(`wiki.yourdomain.com`)"
  - "traefik.http.routers.noodlenook.entrypoints=websecure"
  - "traefik.http.routers.noodlenook.tls.certresolver=letsencrypt"
  
  # Middlewares
  - "traefik.http.routers.noodlenook.middlewares=rate-limit@docker,security-headers@docker"
  
  # Rate limiting
  - "traefik.http.middlewares.rate-limit.ratelimit.average=100"
  - "traefik.http.middlewares.rate-limit.ratelimit.burst=50"
  
  # Security headers
  - "traefik.http.middlewares.security-headers.headers.framedeny=true"
  - "traefik.http.middlewares.security-headers.headers.sslredirect=true"
  - "traefik.http.middlewares.security-headers.headers.stsincludesubdomains=true"
  - "traefik.http.middlewares.security-headers.headers.stspreload=true"
  - "traefik.http.middlewares.security-headers.headers.stsseconds=31536000"
  
  # Service
  - "traefik.http.services.noodlenook.loadbalancer.server.port=3000"
```

---

## Caddy

[Caddy](https://caddyserver.com/) is a powerful web server with automatic HTTPS.

### Prerequisites

- Caddy installed or running in Docker
- NoodleNook running
- Domain name (required for automatic HTTPS)

### Method 1: Caddyfile (Recommended)

Create a `Caddyfile`:

```caddy
# Simple configuration with automatic HTTPS
wiki.yourdomain.com {
    reverse_proxy localhost:3000
}
```

That's it! Caddy automatically obtains and renews SSL certificates.

### Advanced Caddyfile Configuration

```caddy
# Advanced configuration with more options
wiki.yourdomain.com {
    # Automatic HTTPS with Let's Encrypt
    # Email for Let's Encrypt notifications
    tls your-email@example.com

    # Enable compression
    encode gzip

    # Security headers
    header {
        # Enable HSTS
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        # Prevent clickjacking
        X-Frame-Options "SAMEORIGIN"
        # Prevent MIME type sniffing
        X-Content-Type-Options "nosniff"
        # Enable XSS protection
        X-XSS-Protection "1; mode=block"
        # Remove server header
        -Server
    }

    # Reverse proxy to NoodleNook
    reverse_proxy localhost:3000 {
        # Health check
        health_uri /health
        health_interval 30s
        health_timeout 5s
        
        # Headers
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }

    # Access logs
    log {
        output file /var/log/caddy/noodlenook-access.log
        format json
    }

    # Rate limiting (requires Caddy with rate limit module)
    # rate_limit {
    #     zone wiki_rate_limit {
    #         key {remote_host}
    #         events 100
    #         window 1m
    #     }
    # }
}

# Optional: Redirect www to non-www
www.wiki.yourdomain.com {
    redir https://wiki.yourdomain.com{uri} permanent
}
```

### Method 2: Docker Compose with Caddy

```yaml
version: '3.8'

services:
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"  # HTTP/3
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy-data:/data
      - caddy-config:/config
    networks:
      - caddy
    restart: unless-stopped

  frontend:
    build: ./frontend
    networks:
      - caddy
      - backend
    depends_on:
      - backend

  backend:
    build: ./backend
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=noodlenook
      - DB_USER=noodlenook
      - DB_PASSWORD=noodlenook123
      - JWT_SECRET=your-secret-key-change-in-production
    networks:
      - backend
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=noodlenook
      - POSTGRES_USER=noodlenook
      - POSTGRES_PASSWORD=noodlenook123
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - backend

networks:
  caddy:
    driver: bridge
  backend:
    driver: bridge

volumes:
  caddy-data:
  caddy-config:
  postgres-data:
```

### Running Caddy

```bash
# With Caddyfile
caddy run --config Caddyfile

# Or as a daemon
caddy start --config Caddyfile

# Reload configuration without downtime
caddy reload --config Caddyfile

# Stop Caddy
caddy stop
```

### Method 3: Caddy JSON Configuration

If you prefer JSON over Caddyfile:

```json
{
  "apps": {
    "http": {
      "servers": {
        "noodlenook": {
          "listen": [":443"],
          "routes": [
            {
              "match": [
                {
                  "host": ["wiki.yourdomain.com"]
                }
              ],
              "handle": [
                {
                  "handler": "reverse_proxy",
                  "upstreams": [
                    {
                      "dial": "localhost:3000"
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    }
  }
}
```

Run with: `caddy run --config caddy.json`

---

## General Tips

### Security Best Practices

1. **Always use HTTPS in production**
2. **Keep your reverse proxy updated**
3. **Set appropriate timeout values**
4. **Enable rate limiting to prevent abuse**
5. **Configure security headers**
6. **Use strong SSL/TLS settings**
7. **Regularly monitor logs**

### Performance Optimization

1. **Enable caching for static assets**
2. **Use HTTP/2 or HTTP/3**
3. **Enable compression (gzip/brotli)**
4. **Set appropriate buffer sizes**
5. **Configure connection timeouts**

### Troubleshooting

**Connection refused errors:**
- Verify NoodleNook is running: `curl http://localhost:3000`
- Check Docker network connectivity
- Verify firewall rules

**SSL certificate errors:**
- Ensure domain points to your server
- Check that port 80 is accessible (for Let's Encrypt)
- Verify email address in SSL configuration

**WebSocket connection issues:**
- Ensure WebSocket headers are properly set
- Check for timeout configurations
- Verify no middleware is blocking upgrades

**502 Bad Gateway:**
- NoodleNook service is down
- Wrong upstream port configured
- Network connectivity issues

---

## Support

For more help:
- NoodleNook Issues: [GitHub Issues](https://github.com/SluberskiHomeLab/noodlenook/issues)
- Community support in the repository discussions

## Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Nginx Proxy Manager Docs](https://nginxproxymanager.com/guide/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Caddy Documentation](https://caddyserver.com/docs/)
