#!/bin/bash
# SUROVI Dashboard Complete Deployment Script
# Run this script on the server: bash deploy.sh

set -e
echo "========================================="
echo "SUROVI Dashboard Deployment"
echo "========================================="

# Variables
PROJECT_DIR="/home/estiak/SUROVI_DASH"
DB_NAME="surovi_dash"
DB_USER="surovi_user"
DB_PASSWORD="Surovi@Dash2026"

# Step 1: Create PostgreSQL database and user
echo ""
echo "[1/6] Setting up PostgreSQL database..."
sudo -u postgres psql << EOF
-- Create user if not exists
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
      CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD';
   END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF
echo "✓ Database setup complete"

# Step 2: Copy nginx configuration
echo ""
echo "[2/6] Configuring Nginx..."
sudo cp $PROJECT_DIR/deploy/nginx_surovidash.conf /etc/nginx/sites-available/surovidash
sudo ln -sf /etc/nginx/sites-available/surovidash /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
echo "✓ Nginx configured"

# Step 3: Setup systemd service
echo ""
echo "[3/6] Setting up systemd service..."
sudo cp $PROJECT_DIR/deploy/surovidash.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable surovidash
echo "✓ Systemd service configured"

# Step 4: Import database data (if SQL file exists)
echo ""
echo "[4/6] Importing database data..."
if [ -f "$PROJECT_DIR/surovi_data_export.sql" ]; then
    PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f $PROJECT_DIR/surovi_data_export.sql
    echo "✓ Data imported"
else
    echo "! No data file found. You may need to import data manually."
fi

# Step 5: Start backend service
echo ""
echo "[5/6] Starting backend service..."
sudo systemctl start surovidash
sudo systemctl status surovidash --no-pager | head -5
echo "✓ Backend service started"

# Step 6: Final verification
echo ""
echo "[6/6] Verifying deployment..."
sleep 2
curl -s http://localhost:8000/api/health || echo "Backend health check"
echo ""
echo "========================================="
echo "✓ Deployment Complete!"
echo "========================================="
echo ""
echo "Access your dashboard at: http://erp.surovi.net/surovidash"
echo ""
echo "Useful commands:"
echo "  View logs:    sudo journalctl -u surovidash -f"
echo "  Restart:      sudo systemctl restart surovidash"
echo "  Stop:         sudo systemctl stop surovidash"
echo ""
