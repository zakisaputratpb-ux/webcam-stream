# Webcam Stream - Client + Host Websites with OBS Support

A complete self-hosted solution to stream your webcam from one browser tab (client) to another browser tab (host) using WebRTC. The host page can be captured directly in **OBS Studio** using Browser Source.

## Features
- **Client Website**: Minimal interface, captures webcam and streams it silently in the background (even when tab is not active).
- **Host Website**: Clean display of the live client feed. Perfect for OBS.
- **Low latency** WebRTC peer-to-peer connection (signaling via server).
- **Works across networks** (uses public STUN servers).
- **OBS Ready**: Just add the host page as a Browser Source in OBS Studio.

## Project Structure
```
webcam-stream/
├── server.js          # Node.js + Socket.io signaling server
├── package.json
├── public/
│   ├── client.html    # The "invisible" webcam streamer
│   └── host.html      # The viewer / OBS source page
└── README.md
```

## How to Run

### 1. Install dependencies
```bash
cd webcam-stream
npm install
```

### 2. Start the server
```bash
npm start
```

Server will run on **http://localhost:3000**

- **Client page**: http://localhost:3000/client
- **Host page**: http://localhost:3000/host

(You can add `?room=your-custom-room` to both URLs to use a private room instead of "demo")

## Usage Steps

### For the Client (person with webcam)
1. Open **http://localhost:3000/client** (or with `?room=xxx`)
2. Click **"Start Webcam Streaming"**
3. Allow camera permission when prompted
4. The page will show a small preview in the corner (you can hide it or leave it)
5. **Important**: Keep this tab open! The stream continues even if you switch tabs or minimize the browser.

The client page is designed to be minimal — it can even be left running in the background.

### For the Host / OBS
1. Open **http://localhost:3000/host** (same room)
2. You should see the client's webcam appear automatically
3. **For OBS Studio**:
   - In OBS, add a **Browser Source**
   - Check **"Create new"** and name it "Webcam Client"
   - Paste the full **Host URL** (e.g. `http://localhost:3000/host?room=demo`)
   - Set width/height to 1280x720 or your desired resolution
   - Check **"Refresh browser when scene becomes active"** (optional)
   - Click OK

Now your client's webcam appears in OBS as if it were a local camera!

## Advanced Tips

### Custom Room (for multiple setups)
Use the same room name on both client and host:
- Client: `http://localhost:3000/client?room=meeting1`
- Host: `http://localhost:3000/host?room=meeting1`

### Making Client Truly "Invisible"
- You can minimize the client browser window or move it to another monitor.
- The stream keeps running because WebRTC tracks stay active.
- On desktop browsers, the connection usually survives tab switching and even some power-saving modes.

### Firewall / Network Notes
- Works on local network out of the box.
- For remote access (different networks), the STUN servers usually work. If not, you may need a TURN server (not included).

### Security Note
This is a demo project. In production:
- Add authentication
- Use HTTPS (required for getUserMedia in many cases)
- Add TURN server for reliable NAT traversal

## Troubleshooting

**Client can't access camera**:
- Make sure you're using HTTPS in production (localhost is usually allowed)
- Check browser permissions
- Try Chrome/Edge (best WebRTC support)

**No video on host**:
- Make sure both pages use the **same room**
- Check browser console (F12) for errors
- Client must click "Start" first

**OBS shows black screen**:
- Make sure "Hardware Acceleration" is enabled in OBS
- Try checking "Shutdown source when not visible" OFF
- Sometimes refreshing the Browser Source helps

**High latency**:
- WebRTC is very low latency by design. If you see delay, it's usually network or CPU.

## How It Works (Technical)

1. Both pages connect to the signaling server via Socket.io
2. Client requests webcam via `getUserMedia()`
3. Client creates WebRTC `RTCPeerConnection` and sends an **offer**
4. Host receives offer, creates **answer**
5. ICE candidates are exchanged for NAT traversal
6. Video flows directly between browsers (P2P) — server only handles signaling
7. Host displays the remote video stream in a `<video>` element

This architecture gives you the lowest possible latency for browser-to-browser webcam streaming.

---

## 🖥️ Working in Visual Studio Code (Recommended)

This project is fully set up for **VS Code** with nice configurations.

### Step-by-step in VS Code:

1. **Open the project**
   - Open VS Code
   - Go to **File → Open Folder** → select the `webcam-stream` folder

2. **Install recommended extensions** (VS Code will suggest them automatically)
   - **Prettier** – Code formatter
   - **ESLint** (optional)
   - **Live Server** (for testing HTML quickly)
   - **Node.js Extension Pack** (by Microsoft)

3. **Start the server easily**
   - Press `F5` (or go to Run → Start Debugging)
   - Choose **"Run Webcam Stream Server"**
   - The terminal will open and server starts automatically on port 3000

4. **Alternative ways to run**
   - Open integrated terminal (`Ctrl + ``) and type:
     ```bash
     npm start
     ```
   - Or use **Tasks**: `Ctrl + Shift + P` → "Tasks: Run Task" → "Start Server"

5. **Edit & See Changes**
   - Edit `client.html` or `host.html` → save → refresh browser
   - Edit `server.js` → save → server auto-restarts (thanks to launch config)

6. **Debugging**
   - Set breakpoints in `server.js`
   - Press F5 → debug the Node server
   - Use browser DevTools (F12) on client/host pages for frontend debugging

### VS Code Tips for This Project

- The `.vscode/` folder contains:
  - `launch.json` → F5 starts the server instantly
  - `settings.json` → Auto-format on save + nice defaults
  - `tasks.json` → Quick "Start Server" command

- To change default room: Edit the `roomId = 'demo'` line in both HTML files.

---

## 🌍 Use Over the Internet (Long Distance) - ngrok (Recommended)

Your current setup only works on the **same WiFi**.  
To use it from **anywhere in the world** (different city/country), use **ngrok**.

### Why ngrok?
- Gives you a **public HTTPS link** (works from any phone)
- Free for personal use
- No port forwarding needed
- Solves mobile camera permission issues

### Step-by-step (Windows):

1. **Download ngrok**
   - Go to: [https://ngrok.com/download](https://ngrok.com/download)
   - Download **Windows** version

2. **Extract and get your token**
   - Extract the zip
   - Go to [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
   - Copy your authtoken

3. **Connect ngrok (one time)**
   Open Command Prompt and run:
   ```cmd
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

4. **Start your webcam server** (in VS Code)
   ```cmd
   npm start
   ```

5. **Start ngrok tunnel** (new terminal)
   ```cmd
   ngrok http 3000
   ```

6. **Copy the public link**
   ngrok will show something like:
   ```
   Forwarding  https://abc123-xyz.ngrok-free.app -> http://localhost:3000
   ```

7. **Use on any phone (anywhere)**
   - **Client** (webcam): `https://abc123-xyz.ngrok-free.app/client`
   - **Host** (OBS):   `https://abc123-xyz.ngrok-free.app/host`

Now you can use it from **long distance**!

**Tip**: Keep both terminals open (your server + ngrok).

---

Made for easy OBS integration and remote webcam use cases. Enjoy streaming! 🎥

---

Made for easy OBS integration and remote webcam use cases. Enjoy streaming! 🎥

**Tip**: After opening in VS Code, run `npm install` once if `node_modules` is missing.