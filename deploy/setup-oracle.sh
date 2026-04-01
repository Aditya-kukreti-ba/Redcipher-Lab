#!/bin/bash
# ─── RedCipher Labs — Oracle Cloud VM Setup Script ────────────────────────────
# Run this ONCE on your fresh Oracle Cloud Ubuntu instance after SSH-ing in.
# Usage: bash setup-oracle.sh

set -e  # Exit on any error

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   RedCipher Labs — Oracle Cloud Setup Script     ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ─── Step 1: Update system ────────────────────────────────────────────────────
echo "📦 Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# ─── Step 2: Install Docker ───────────────────────────────────────────────────
echo "🐳 Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release git

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) \
  signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add current user to docker group (no sudo needed)
sudo usermod -aG docker $USER

# ─── Step 3: Install Docker Compose ──────────────────────────────────────────
echo "🔧 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# ─── Step 4: Open firewall port 4000 ─────────────────────────────────────────
echo "🔓 Opening port 4000 in iptables..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 4000 -j ACCEPT
sudo netfilter-persistent save

# ─── Step 5: Start Docker service ────────────────────────────────────────────
echo "🚀 Starting Docker..."
sudo systemctl start docker
sudo systemctl enable docker

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Upload your project:  scp -r redcipher-labs ubuntu@<YOUR_IP>:~/redcipher-labs"
echo "  2. Go to project folder: cd ~/redcipher-labs"
echo "  3. Edit .env file:       nano Backend/.env"
echo "  4. Start the backend:    docker-compose up -d --build"
echo "  5. Check logs:           docker-compose logs -f"
echo ""
echo "⚠️  Log out and back in for docker group changes to apply."
