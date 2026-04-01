# 🚀 RedCipher Labs — Oracle Cloud Deployment Guide

Migrate your backend from Railway → Oracle Cloud Always Free (forever free, never expires).

---

## ✅ What You Get on Oracle Cloud Free Tier

| Resource | Free Amount |
|----------|-------------|
| ARM VMs (Ampere A1) | 4 OCPU + 24GB RAM total |
| AMD VMs | 2× micro instances |
| Block storage | 200 GB |
| Outbound data | 10 TB/month |
| Expires? | **NEVER** |

---

## STEP 1 — Create Oracle Cloud Account

1. Go to → https://www.oracle.com/cloud/free/
2. Click **Start for Free**
3. Fill in your details (requires a credit card for identity verification — you will NOT be charged)
4. Select your **Home Region** (pick the closest to you — cannot be changed later)
5. Complete email verification
6. Wait for account activation (~10 minutes)

---

## STEP 2 — Create a Free VM Instance

1. Log into Oracle Cloud Console → https://cloud.oracle.com
2. Go to **Compute → Instances → Create Instance**
3. Configure:
   - **Name:** `redcipher-backend`
   - **Image:** Ubuntu 22.04 (click "Change Image" → select Ubuntu)
   - **Shape:** Click "Change Shape" → Select **Ampere → VM.Standard.A1.Flex**
     - Set **OCPU: 1**, **Memory: 6 GB** (all free)
   - **Networking:** Keep defaults (VCN will be auto-created)
   - **SSH Keys:** 
     - Click "Generate a key pair for me"
     - **Download both** private and public keys → save as `oracle_key.pem`
4. Click **Create**
5. Wait ~2 minutes for the instance to show **RUNNING**
6. Copy the **Public IP Address** (you'll need this)

---

## STEP 3 — Open Port 4000 in Oracle Firewall

Oracle has TWO firewalls — both must be opened:

### A) Security List (Oracle's firewall)
1. Go to **Networking → Virtual Cloud Networks → your VCN**
2. Click **Security Lists → Default Security List**
3. Click **Add Ingress Rules**
4. Fill in:
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: `TCP`
   - Destination Port Range: `4000`
5. Click **Add Ingress Rules** ✅

### B) VM's iptables (Linux firewall)
Run this AFTER SSH-ing in (Step 4):
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 4000 -j ACCEPT
sudo netfilter-persistent save
```

---

## STEP 4 — SSH Into Your VM

Open **Command Prompt** or **PowerShell** on Windows:

```bash
# Fix key permissions first (required on Windows)
icacls oracle_key.pem /inheritance:r /grant:r "%USERNAME%:R"

# SSH into the VM
ssh -i oracle_key.pem ubuntu@YOUR_ORACLE_VM_PUBLIC_IP
```

Replace `YOUR_ORACLE_VM_PUBLIC_IP` with the IP from Step 2.

---

## STEP 5 — Run the Setup Script on the VM

Once SSH'd in, run these commands:

```bash
# Update system & install Docker
sudo apt-get update -y && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Open port 4000
sudo apt-get install -y iptables-persistent
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 4000 -j ACCEPT
sudo netfilter-persistent save

# Log out and back in for docker group to apply
exit
```

SSH back in:
```bash
ssh -i oracle_key.pem ubuntu@YOUR_ORACLE_VM_PUBLIC_IP
```

---

## STEP 6 — Upload Your Project to the VM

Run this from your **Windows machine** (not the VM):

```bash
# Upload the whole project to the VM
scp -i oracle_key.pem -r "C:\Users\adity\Downloads\Projects\redcipher-labs" ubuntu@YOUR_ORACLE_VM_PUBLIC_IP:~/redcipher-labs
```

---

## STEP 7 — Configure the .env on the VM

SSH into the VM and edit the backend .env:

```bash
cd ~/redcipher-labs
nano Backend/.env
```

Update these values:
```env
PORT=4000
JWT_SECRET=PASTE_YOUR_STRONG_SECRET_HERE
HF_TOKEN=hf_YOUR_HUGGINGFACE_TOKEN
HF_MODEL=meta-llama/Llama-3.1-8B-Instruct
FRONTEND_URL=https://redcipher-lab.vercel.app
DB_PATH=/app/data/redcipher.db
BACKEND_URL=http://YOUR_ORACLE_VM_PUBLIC_IP:4000
```

Save: `Ctrl+X` → `Y` → `Enter`

Generate a strong JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## STEP 8 — Build & Start the Backend

```bash
cd ~/redcipher-labs

# Build and start (runs in background, auto-restarts on reboot)
docker-compose up -d --build

# Check it's running
docker-compose ps

# View live logs
docker-compose logs -f
```

Test it works:
```bash
curl http://YOUR_ORACLE_VM_PUBLIC_IP:4000/api/health
# Expected: {"status":"ok","time":"..."}
```

---

## STEP 9 — Update Vercel Frontend

1. Go to → https://vercel.com/dashboard
2. Open your **redcipher-lab** project
3. Go to **Settings → Environment Variables**
4. Update `VITE_API_URL`:
   ```
   VITE_API_URL=http://YOUR_ORACLE_VM_PUBLIC_IP:4000
   ```
5. Click **Save**
6. Go to **Deployments → Redeploy** (to apply the new env var)

---

## STEP 10 — Test Everything

Open https://redcipher-lab.vercel.app and verify:
- ✅ Register / Login works
- ✅ Dashboard loads your progress
- ✅ Level chat works (Levels 1–5)
- ✅ Level 5 payload hosting works
- ✅ Certificate generation works

---

## 🔄 Useful Commands (on the VM)

```bash
# View logs
docker-compose -f ~/redcipher-labs/docker-compose.yml logs -f

# Restart backend
docker-compose -f ~/redcipher-labs/docker-compose.yml restart

# Stop backend
docker-compose -f ~/redcipher-labs/docker-compose.yml down

# Update code & rebuild
cd ~/redcipher-labs
git pull   # if using git
docker-compose up -d --build

# Backup database
docker cp redcipher-backend:/app/data/redcipher.db ~/redcipher-backup.db
```

---

## 🆙 Migrate Existing Railway Database (Optional)

If you have existing user data on Railway:

1. On Railway: go to your service → **Shell**
2. Run: `cp /app/redcipher.db /tmp/redcipher-export.db`
3. Download via Railway's file explorer
4. Upload to Oracle VM:
   ```bash
   scp -i oracle_key.pem redcipher-export.db ubuntu@YOUR_IP:~/redcipher-labs/
   ```
5. Copy into Docker volume:
   ```bash
   docker cp ~/redcipher-labs/redcipher-export.db redcipher-backend:/app/data/redcipher.db
   docker-compose restart
   ```

---

## ✅ Summary

| | Before (Railway) | After (Oracle Cloud) |
|--|--|--|
| Cost | Hit free limit 💸 | **Free forever** ✅ |
| Uptime | Limited | **Always on** ✅ |
| Storage | Ephemeral | **Persistent 200GB** ✅ |
| SQLite | ✅ | ✅ (unchanged) |
| DB data | Resets | **Survives restarts** ✅ |

---

> Built for Oracle Cloud Always Free Tier (ARM64 Ampere A1)
