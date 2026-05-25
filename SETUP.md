# FictionHub - Setup Guide

## Making it work on other devices (same WiFi network)

### Step 1 — Find your computer's local IP
- **Windows**: Open CMD → type `ipconfig` → look for `IPv4 Address` (e.g. `192.168.1.100`)
- **Mac/Linux**: Open Terminal → type `ifconfig` or `ip addr` → look for `inet` under your WiFi adapter

### Step 2 — Update backend CORS
In `backend/.env`, change:
```
CORS_ORIGIN=*
```
(already set to `*` so all devices on the network can connect)

### Step 3 — Update frontend API URL
In `.env` (root of project), change to your computer's IP:
```
VITE_API_BASE_URL=http://192.168.1.100:5000
```
(replace `192.168.1.100` with your actual IP)

### Step 4 — Start both servers
```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
npm run dev -- --host
```

The `--host` flag makes Vite accessible from other devices on the network.

### Step 5 — Access from phone/other device
Open browser on your phone and go to:
```
http://192.168.1.100:5173
```
(replace with your computer's IP, port 5173 is Vite's default)

---

## What was changed

### Bug Fixes
- **Login now actually checks your password** (before it was letting anyone in!)
- Login and Register now show proper validation errors
- User lookup now works by both username and MongoDB ID (needed for chat)

### New Features
- **Chat system** — click the message icon in the header to open chat
  - See all users you can message
  - View recent conversations
  - Real-time-ish messaging (polls every 3 seconds)
- Chat routes: `/chat` (user list) and `/chat/:userId` (conversation)

### Multi-device Support
- All `http://localhost:5000` hardcoded URLs replaced with `VITE_API_BASE_URL` env variable
- Change one line in `.env` to point to your server IP

### Mobile Improvements
- Login/Register pages are fully mobile-responsive
- Header adapts to small screens
- Chat UI is mobile-first (full-screen conversation view)
