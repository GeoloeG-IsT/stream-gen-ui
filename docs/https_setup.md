Option 1: Cloudflare Tunnel (Recommended - Free subdomain)
This gives you a free *.trycloudflare.com subdomain with valid HTTPS:


# Install cloudflared

```bash
sudo curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# Run quick tunnel (gives you a random subdomain)
cloudflared tunnel --url http://localhost:8000
Output will show something like:

or 

nohup cloudflared tunnel --url http://localhost:8000 > /tmp/cloudflared.log 2>&1 &
cat /tmp/cloudflared.log  # See the URL
```


Your quick Tunnel has been created! Visit it at:
https://repairs-lan-bytes-church.trycloudflare.com

Then set your frontend:

```bash
NEXT_PUBLIC_BACKEND_URL=https://repairs-lan-bytes-church.trycloudflare.com
To make it persistent as a service:
```

```bash
# Create service file
sudo tee /etc/systemd/system/cloudflared.service << 'EOF'
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/cloudflared tunnel --url http://localhost:8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo journalctl -u cloudflared -f  # See the URL
```


Option 2: Self-signed certificate (Browser warnings)
This works but users will see "Your connection is not private" warnings:


# Generate self-signed cert
mkdir -p /etc/ssl/private
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/selfsigned.key \
  -out /etc/ssl/certs/selfsigned.crt \
  -subj "/CN=188.245.108.179"

# Install caddy
sudo apt install caddy

# Configure /etc/caddy/Caddyfile
sudo tee /etc/caddy/Caddyfile << 'EOF'
:443 {
    tls /etc/ssl/certs/selfsigned.crt /etc/ssl/private/selfsigned.key
    reverse_proxy localhost:8000
}
EOF

sudo systemctl restart caddy
Then use https://188.245.108.179 (users must click through browser warning).

Option 3: Free subdomain with DuckDNS
Get a free subdomain that works with Let's Encrypt:

Go to https://www.duckdns.org and sign in
Create a subdomain like stream-gen-api.duckdns.org
Point it to 188.245.108.179
Then use Caddy:


# /etc/caddy/Caddyfile
stream-gen-api.duckdns.org {
    reverse_proxy localhost:8000
}