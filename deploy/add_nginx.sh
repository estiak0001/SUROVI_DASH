#!/bin/bash
# Run this script on the server to add surovidash to nginx

# Add surovidash server block to nginx config
sudo tee -a /etc/nginx/sites-available/default << 'NGINX_EOF'

# ========== SUROVIDASH - Added by deployment script ==========
server {
    listen 80;
    server_name erp.surovi.net agro.surovi.net;

    # SUROVI Dashboard - Frontend static files
    location /surovidash {
        alias /home/estiak/SUROVI_DASH/frontend/dist;
        try_files $uri $uri/ /surovidash/index.html;
    }

    # SUROVI Dashboard - API backend proxy
    location /surovidash/api {
        rewrite ^/surovidash/api(.*)$ /api$1 break;
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }
}
# ========== END SUROVIDASH ==========
NGINX_EOF

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx
echo "Nginx configured for surovidash"
