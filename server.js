const PORT = process.env.PORT || 3000;
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// Serve client and host pages
app.get('/client', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

app.get('/host', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'host.html'));
});

// Landing page with two options (or auto-redirect mobile to client)
app.get('/', (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
  
  if (isMobile) {
    res.redirect('/client');
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

const rooms = new Map(); // roomId -> { clients: Set, hosts: Set }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, role }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { clients: new Set(), hosts: new Set() });
    }
    
    const room = rooms.get(roomId);
    
    if (role === 'client') {
      room.clients.add(socket.id);
      console.log(`Client ${socket.id} joined room ${roomId}`);
    } else if (role === 'host') {
      room.hosts.add(socket.id);
      console.log(`Host ${socket.id} joined room ${roomId}`);
    }
    
    // Notify others in room
    socket.to(roomId).emit('user-joined', { id: socket.id, role });
    
    // If both present, notify to start signaling
    if (room.clients.size > 0 && room.hosts.size > 0) {
      io.to(roomId).emit('ready-to-connect');
    }
  });

  socket.on('offer', ({ roomId, offer }) => {
    console.log(`Offer from ${socket.id} in ${roomId}`);
    socket.to(roomId).emit('offer', { offer, from: socket.id });
  });

  socket.on('answer', ({ roomId, answer }) => {
    console.log(`Answer from ${socket.id} in ${roomId}`);
    socket.to(roomId).emit('answer', { answer, from: socket.id });
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', { candidate, from: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Clean up rooms
    for (const [roomId, room] of rooms.entries()) {
      room.clients.delete(socket.id);
      room.hosts.delete(socket.id);
      
      if (room.clients.size === 0 && room.hosts.size === 0) {
        rooms.delete(roomId);
      } else {
        socket.to(roomId).emit('user-left', { id: socket.id });
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

// Listen on all network interfaces so phones can connect
server.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  // Find local IP address
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }
  
  console.log(`\n✅ Server running!`);
  console.log(`\n📱 On this computer:`);
  console.log(`   Client: http://localhost:${PORT}/client`);
  console.log(`   Host:   http://localhost:${PORT}/host`);
  
  console.log(`\n📱 On your PHONE (same WiFi):`);
  console.log(`   Client: http://${localIP}:${PORT}/client`);
  console.log(`   Host:   http://${localIP}:${PORT}/host`);
  
  console.log(`\n💡 Tip: Make sure your phone and computer are on the same WiFi network.`);
});