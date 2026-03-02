# 🔴 RedCipher Labs

> **A free, hands-on AI prompt injection training platform.**  
> Learn how to exploit AI systems through 5 progressively harder levels — from basic overrides to indirect injection attacks.

🔗 **Live Site:** [https://redcipher-lab.vercel.app](https://redcipher-lab.vercel.app)

---

## 📸 Screenshots

### Dashboard
<img width="1919" height="869" alt="Image" src="https://github.com/user-attachments/assets/02a3eeb4-1aed-4a75-b71c-09efcc550a0f" />

### Level 2 — Context Confusion
<img width="1913" height="882" alt="Image" src="https://github.com/user-attachments/assets/145e06ff-d1b2-4bab-8dd4-76637a594931" />

### Level 5 — Indirect Injection (Final Boss)
<img width="1919" height="870" alt="Image" src="https://github.com/user-attachments/assets/058e0cbb-a474-4edd-9108-e21103f4f5fa" />

### Certificate of Completion
<img width="1186" height="850" alt="Image" src="https://github.com/user-attachments/assets/b4a1fe43-7ce8-45d6-a005-e604abdded95" />

---

## 🧠 What is Prompt Injection?

Prompt injection is an attack technique where an attacker manipulates an AI model by embedding malicious instructions into its input — causing it to ignore its original instructions and behave in unintended ways. It is one of the most critical vulnerabilities in modern AI-powered applications.

RedCipher Labs teaches you how these attacks work in a safe, gamified environment.

---

## 🎮 Levels

| # | Title | Difficulty | Technique |
|---|-------|-----------|-----------|
| 1 | Basic Override | 🟢 NOVICE | Direct instruction override |
| 2 | Context Confusion | 🟡 APPRENTICE | Table injection & language switching |
| 3 | Policy Bypass | 🟠 OPERATIVE | Legal framing & social engineering |
| 4 | Privilege Escalation | 🔴 SPECIALIST | Identity spoofing & domain manipulation |
| 5 | Indirect Injection | 🟣 PHANTOM | URL-based indirect prompt injection |

Each level features a real AI agent (powered by HuggingFace) that you must exploit to extract a hidden flag. The agent actively resists your attempts — you need to think creatively!

---

## 🏆 Certificate

Complete all 5 levels to earn an official **Certificate of Completion** as a Certified AI Prompt Injection Specialist.

<img width="2000" height="1414" alt="Image" src="https://github.com/user-attachments/assets/2f117787-79f5-48f3-a0fa-1429376135c8" />

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | SQLite (sql.js) |
| AI Models | HuggingFace Inference API |
| Auth | JWT |
| Hosting | Vercel (frontend) + Railway (backend) |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- A HuggingFace account with an API token ([get one here](https://huggingface.co/settings/tokens))

### Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` folder:
```env
PORT=4000
JWT_SECRET=your_secret_key_here
HF_TOKEN=hf_your_huggingface_token
HF_MODEL=meta-llama/Llama-3.1-8B-Instruct
FRONTEND_URL=http://localhost:5173
DB_PATH=./redcipher.db
BACKEND_URL=http://localhost:4000
```

Start the backend:
```bash
npm start
```

### Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file in the `Frontend` folder:
```env
VITE_API_URL=http://localhost:4000
```

Start the frontend:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
redcipher-labs/
├── Backend/
│   ├── server.js        # Express server + all API routes
│   ├── auth.js          # JWT authentication
│   ├── db.js            # SQLite database (sql.js)
│   ├── flags.js         # Flag validation logic
│   └── package.json
└── Frontend/
    ├── src/
    │   └── App.jsx      # Full React application (single file)
    ├── public/
    │   ├── certificate-bg.png
    │   └── favicon.png
    └── package.json
```

---

## 🔐 How the Flags Work

- **Level 1** — Validated client-side (introductory level)
- **Levels 2–4** — The AI model must actually leak the secret in its response for the flag to appear
- **Level 5** — You must craft a malicious HTML payload, host it using the built-in Payload Workshop, and make the agent fetch it — the injected instructions must cause the agent to leak its internal credentials

---

## ⚠️ Disclaimer

RedCipher Labs is purely for **educational purposes**. The techniques taught here demonstrate real vulnerabilities in AI systems. Use this knowledge responsibly and ethically.

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">
  <p>Built with ❤️ for the AI security community</p>
  <a href="https://redcipher-lab.vercel.app">🔴 Try it now →</a>
</div>
