const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, "public")));

// ── City database (150 Indian cities across all states & UTs) ──
const CITIES = [
  // Metros & Tier-1
  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { name: "Delhi", state: "Delhi", lat: 28.7041, lng: 77.1025 },
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },

  // Rajasthan
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { name: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125 },
  { name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243 },
  { name: "Jaisalmer", state: "Rajasthan", lat: 26.9157, lng: 70.9083 },
  { name: "Ajmer", state: "Rajasthan", lat: 26.4499, lng: 74.6399 },
  { name: "Bikaner", state: "Rajasthan", lat: 28.0229, lng: 73.3119 },
  { name: "Pushkar", state: "Rajasthan", lat: 26.4898, lng: 74.5511 },
  { name: "Mount Abu", state: "Rajasthan", lat: 24.5926, lng: 72.7156 },

  // Uttar Pradesh
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  { name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081 },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
  { name: "Prayagraj", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463 },
  { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.391 },
  { name: "Mathura", state: "Uttar Pradesh", lat: 27.4924, lng: 77.6737 },
  { name: "Aligarh", state: "Uttar Pradesh", lat: 27.8974, lng: 78.088 },
  { name: "Gorakhpur", state: "Uttar Pradesh", lat: 26.7606, lng: 83.3732 },
  { name: "Bareilly", state: "Uttar Pradesh", lat: 28.367, lng: 79.4304 },

  // Maharashtra
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
  { name: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898 },
  { name: "Aurangabad", state: "Maharashtra", lat: 19.8762, lng: 75.3433 },
  { name: "Kolhapur", state: "Maharashtra", lat: 16.7050, lng: 74.2433 },
  { name: "Solapur", state: "Maharashtra", lat: 17.6599, lng: 75.9064 },
  { name: "Lonavala", state: "Maharashtra", lat: 18.7546, lng: 73.4062 },

  // Tamil Nadu
  { name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { name: "Pondicherry", state: "Puducherry", lat: 11.9416, lng: 79.8083 },
  { name: "Thanjavur", state: "Tamil Nadu", lat: 10.787, lng: 79.1378 },
  { name: "Ooty", state: "Tamil Nadu", lat: 11.4102, lng: 76.695 },
  { name: "Kodaikanal", state: "Tamil Nadu", lat: 10.2381, lng: 77.4892 },
  { name: "Rameswaram", state: "Tamil Nadu", lat: 9.2876, lng: 79.3129 },
  { name: "Kanyakumari", state: "Tamil Nadu", lat: 8.0883, lng: 77.5385 },
  { name: "Salem", state: "Tamil Nadu", lat: 11.6643, lng: 78.146 },
  { name: "Tiruchirappalli", state: "Tamil Nadu", lat: 10.7905, lng: 78.7047 },

  // Kerala
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366 },
  { name: "Munnar", state: "Kerala", lat: 10.0889, lng: 77.0595 },
  { name: "Alleppey", state: "Kerala", lat: 9.4981, lng: 76.3388 },
  { name: "Kozhikode", state: "Kerala", lat: 11.2588, lng: 75.7804 },
  { name: "Thrissur", state: "Kerala", lat: 10.5276, lng: 76.2144 },
  { name: "Wayanad", state: "Kerala", lat: 11.6854, lng: 76.132 },

  // Karnataka
  { name: "Mysore", state: "Karnataka", lat: 12.2958, lng: 76.6394 },
  { name: "Mangalore", state: "Karnataka", lat: 12.9141, lng: 74.856 },
  { name: "Hampi", state: "Karnataka", lat: 15.335, lng: 76.46 },
  { name: "Hubli", state: "Karnataka", lat: 15.3647, lng: 75.124 },
  { name: "Belgaum", state: "Karnataka", lat: 15.8497, lng: 74.4977 },
  { name: "Coorg", state: "Karnataka", lat: 12.3375, lng: 75.8069 },
  { name: "Badami", state: "Karnataka", lat: 15.915, lng: 75.6775 },

  // Gujarat
  { name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
  { name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812 },
  { name: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022 },
  { name: "Gandhinagar", state: "Gujarat", lat: 23.2156, lng: 72.6369 },
  { name: "Dwarka", state: "Gujarat", lat: 22.2442, lng: 68.9685 },
  { name: "Kutch", state: "Gujarat", lat: 23.7337, lng: 69.8597 },
  { name: "Junagadh", state: "Gujarat", lat: 21.5222, lng: 70.4579 },
  { name: "Somnath", state: "Gujarat", lat: 20.8880, lng: 70.4013 },

  // West Bengal
  { name: "Darjeeling", state: "West Bengal", lat: 27.0360, lng: 88.2627 },
  { name: "Siliguri", state: "West Bengal", lat: 26.7271, lng: 88.3953 },
  { name: "Shantiniketan", state: "West Bengal", lat: 23.6783, lng: 87.6855 },
  { name: "Digha", state: "West Bengal", lat: 21.6279, lng: 87.5096 },

  // Madhya Pradesh
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
  { name: "Khajuraho", state: "Madhya Pradesh", lat: 24.8318, lng: 79.9199 },
  { name: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lng: 78.1828 },
  { name: "Ujjain", state: "Madhya Pradesh", lat: 23.1765, lng: 75.7885 },
  { name: "Sanchi", state: "Madhya Pradesh", lat: 23.4793, lng: 77.7397 },
  { name: "Pachmarhi", state: "Madhya Pradesh", lat: 22.4675, lng: 78.4341 },

  // Bihar & Jharkhand
  { name: "Patna", state: "Bihar", lat: 25.6093, lng: 85.1376 },
  { name: "Bodh Gaya", state: "Bihar", lat: 24.6961, lng: 84.9911 },
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096 },
  { name: "Jamshedpur", state: "Jharkhand", lat: 22.8046, lng: 86.2029 },

  // Odisha
  { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245 },
  { name: "Puri", state: "Odisha", lat: 19.8135, lng: 85.8312 },
  { name: "Konark", state: "Odisha", lat: 19.8876, lng: 86.0945 },
  { name: "Cuttack", state: "Odisha", lat: 20.4625, lng: 85.8830 },

  // Andhra Pradesh & Telangana
  { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
  { name: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.6480 },
  { name: "Tirupati", state: "Andhra Pradesh", lat: 13.6288, lng: 79.4192 },
  { name: "Warangal", state: "Telangana", lat: 17.9784, lng: 79.5941 },
  { name: "Amaravati", state: "Andhra Pradesh", lat: 16.5131, lng: 80.5150 },

  // Punjab & Haryana
  { name: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { name: "Amritsar", state: "Punjab", lat: 31.634, lng: 74.8723 },
  { name: "Ludhiana", state: "Punjab", lat: 30.901, lng: 75.8573 },
  { name: "Jalandhar", state: "Punjab", lat: 31.326, lng: 75.5762 },
  { name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266 },
  { name: "Faridabad", state: "Haryana", lat: 28.4089, lng: 77.3178 },
  { name: "Karnal", state: "Haryana", lat: 29.6857, lng: 76.9905 },
  { name: "Kurukshetra", state: "Haryana", lat: 29.9695, lng: 76.8783 },

  // Himachal Pradesh & Uttarakhand
  { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
  { name: "Manali", state: "Himachal Pradesh", lat: 32.2396, lng: 77.1887 },
  { name: "Dharamshala", state: "Himachal Pradesh", lat: 32.219, lng: 76.3234 },
  { name: "Kasol", state: "Himachal Pradesh", lat: 32.0101, lng: 77.3146 },
  { name: "Spiti Valley", state: "Himachal Pradesh", lat: 32.2464, lng: 78.0349 },
  { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
  { name: "Rishikesh", state: "Uttarakhand", lat: 30.0869, lng: 78.2676 },
  { name: "Haridwar", state: "Uttarakhand", lat: 29.9457, lng: 78.1642 },
  { name: "Mussoorie", state: "Uttarakhand", lat: 30.4598, lng: 78.0644 },
  { name: "Nainital", state: "Uttarakhand", lat: 29.3803, lng: 79.4636 },

  // Jammu & Kashmir and Ladakh
  { name: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973 },
  { name: "Leh", state: "Ladakh", lat: 34.1526, lng: 77.5771 },
  { name: "Gulmarg", state: "Jammu & Kashmir", lat: 34.0484, lng: 74.3805 },
  { name: "Pahalgam", state: "Jammu & Kashmir", lat: 34.0161, lng: 75.3150 },
  { name: "Jammu", state: "Jammu & Kashmir", lat: 32.7266, lng: 74.857 },

  // Northeast
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362 },
  { name: "Shillong", state: "Meghalaya", lat: 25.5788, lng: 91.8933 },
  { name: "Imphal", state: "Manipur", lat: 24.817, lng: 93.9368 },
  { name: "Gangtok", state: "Sikkim", lat: 27.3389, lng: 88.6065 },
  { name: "Agartala", state: "Tripura", lat: 23.8315, lng: 91.2868 },
  { name: "Aizawl", state: "Mizoram", lat: 23.7307, lng: 92.7173 },
  { name: "Kohima", state: "Nagaland", lat: 25.6751, lng: 94.1086 },
  { name: "Itanagar", state: "Arunachal Pradesh", lat: 27.0844, lng: 93.6053 },
  { name: "Tawang", state: "Arunachal Pradesh", lat: 27.5861, lng: 91.8594 },
  { name: "Kaziranga", state: "Assam", lat: 26.5775, lng: 93.1711 },
  { name: "Majuli", state: "Assam", lat: 26.9500, lng: 94.1672 },

  // Goa
  { name: "Panaji", state: "Goa", lat: 15.4909, lng: 73.8278 },
  { name: "Margao", state: "Goa", lat: 15.2832, lng: 73.9862 },
  { name: "Vasco da Gama", state: "Goa", lat: 15.3982, lng: 73.8113 },

  // Chhattisgarh
  { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296 },
  { name: "Bilaspur", state: "Chhattisgarh", lat: 22.0797, lng: 82.1409 },
  { name: "Jagdalpur", state: "Chhattisgarh", lat: 19.0868, lng: 82.0206 },

  // Andaman & Islands
  { name: "Port Blair", state: "Andaman & Nicobar", lat: 11.6234, lng: 92.7265 },

  // Assorted others
  { name: "Jhansi", state: "Uttar Pradesh", lat: 25.4484, lng: 78.5685 },
  { name: "Bhuj", state: "Gujarat", lat: 23.2420, lng: 69.6669 },
  { name: "Madikeri", state: "Karnataka", lat: 12.4208, lng: 75.7397 },
  { name: "Allahabad", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463 },
  { name: "Ratnagiri", state: "Maharashtra", lat: 16.9902, lng: 73.3120 },
  { name: "Diu", state: "Daman & Diu", lat: 20.7141, lng: 70.9876 },
  { name: "Lakshadweep", state: "Lakshadweep", lat: 10.5626, lng: 72.6369 },
  { name: "Kharagpur", state: "West Bengal", lat: 22.3460, lng: 87.2320 },
];

// ── Game state ─────────────────────────────────────────────────────
const rooms = new Map();

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function pickCities(n) {
  const shuffled = [...CITIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcScore(distKm) {
  // 5000 pts at 0 km, 0 pts at ≥ 2000 km (tighter for India-scale map)
  return Math.max(0, Math.round(5000 * (1 - distKm / 2000)));
}

function broadcast(room, msg) {
  const data = JSON.stringify(msg);
  for (const p of room.players.values()) {
    if (p.ws.readyState === 1) p.ws.send(data);
  }
  if (room.host && room.host.readyState === 1) room.host.send(data);
}

function sendPlayerList(room) {
  const players = [...room.players.values()].map((p) => ({
    id: p.id,
    name: p.name,
    score: p.totalScore,
    connected: p.ws.readyState === 1,
  }));
  broadcast(room, { type: "playerList", players });
}

// ── WebSocket handling ─────────────────────────────────────────────
wss.on("connection", (ws) => {
  let playerId = null;
  let roomCode = null;
  let isHost = false;

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    // ── Host creates room ──
    if (msg.type === "createRoom") {
      const code = generateCode();
      const room = {
        code,
        host: ws,
        players: new Map(),
        cities: pickCities(10),
        currentRound: -1,
        guesses: new Map(),
        timerHandle: null,
        state: "lobby", // lobby | question | results | finished
      };
      rooms.set(code, room);
      roomCode = code;
      isHost = true;
      ws.send(JSON.stringify({ type: "roomCreated", code }));
    }

    // ── Player joins room ──
    if (msg.type === "joinRoom") {
      const room = rooms.get(msg.code?.toUpperCase());
      if (!room) return ws.send(JSON.stringify({ type: "error", msg: "Room not found" }));
      if (room.state !== "lobby")
        return ws.send(JSON.stringify({ type: "error", msg: "Game already started" }));

      playerId = Math.random().toString(36).slice(2, 10);
      roomCode = room.code;
      const player = { id: playerId, name: msg.name || "Anon", ws, totalScore: 0 };
      room.players.set(playerId, player);
      ws.send(JSON.stringify({ type: "joined", playerId, code: room.code }));
      sendPlayerList(room);
    }

    // ── Host starts game ──
    if (msg.type === "startGame" && isHost) {
      const room = rooms.get(roomCode);
      if (!room || room.players.size === 0) return;
      nextRound(room);
    }

    // ── Host advances to next round from results ──
    if (msg.type === "nextRound" && isHost) {
      const room = rooms.get(roomCode);
      if (!room) return;
      nextRound(room);
    }

    // ── Player submits guess ──
    if (msg.type === "guess" && playerId) {
      const room = rooms.get(roomCode);
      if (!room || room.state !== "question") return;
      room.guesses.set(playerId, { lat: msg.lat, lng: msg.lng });
      // notify host how many guesses are in
      if (room.host && room.host.readyState === 1) {
        room.host.send(
          JSON.stringify({
            type: "guessCount",
            count: room.guesses.size,
            total: room.players.size,
          })
        );
      }
      ws.send(JSON.stringify({ type: "guessAck" }));
      // If all players guessed, end round early
      if (room.guesses.size >= room.players.size) {
        clearTimeout(room.timerHandle);
        endRound(room);
      }
    }
  });

  ws.on("close", () => {
    if (roomCode) {
      const room = rooms.get(roomCode);
      if (room) {
        if (isHost) {
          broadcast(room, { type: "hostLeft" });
          clearTimeout(room.timerHandle);
          rooms.delete(roomCode);
        } else {
          sendPlayerList(room);
        }
      }
    }
  });
});

function nextRound(room) {
  room.currentRound++;
  if (room.currentRound >= room.cities.length) {
    room.state = "finished";
    const final = [...room.players.values()]
      .map((p) => ({ name: p.name, score: p.totalScore }))
      .sort((a, b) => b.score - a.score);
    broadcast(room, { type: "gameOver", leaderboard: final });
    return;
  }

  room.state = "question";
  room.guesses = new Map();
  const city = room.cities[room.currentRound];
  broadcast(room, {
    type: "newRound",
    round: room.currentRound + 1,
    total: room.cities.length,
    city: city.name,
    country: city.state,
    timeLimit: 20,
  });

  room.timerHandle = setTimeout(() => endRound(room), 21000);
}

function endRound(room) {
  room.state = "results";
  const city = room.cities[room.currentRound];
  const results = [];

  for (const [pid, player] of room.players) {
    const guess = room.guesses.get(pid);
    let dist = null;
    let pts = 0;
    if (guess) {
      dist = haversineKm(city.lat, city.lng, guess.lat, guess.lng);
      pts = calcScore(dist);
    }
    player.totalScore += pts;
    results.push({
      id: pid,
      name: player.name,
      guessLat: guess?.lat ?? null,
      guessLng: guess?.lng ?? null,
      distance: dist !== null ? Math.round(dist) : null,
      roundScore: pts,
      totalScore: player.totalScore,
    });
  }

  results.sort((a, b) => (b.roundScore ?? 0) - (a.roundScore ?? 0));

  broadcast(room, {
    type: "roundResults",
    round: room.currentRound + 1,
    total: room.cities.length,
    city: { name: city.name, country: city.state, lat: city.lat, lng: city.lng },
    results,
  });
}

// ── Start ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n  🇮🇳 GeoPin India is running at http://localhost:${PORT}\n`);
});
