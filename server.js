const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, "public")));

// ── Debug endpoint ──
app.get("/debug", (req, res) => {
  const roomList = [...rooms.entries()].map(([code, room]) => ({
    code,
    state: room.state,
    players: room.players.size,
    hostConnected: room.host?.readyState === 1,
    currentRound: room.currentRound,
  }));
  res.json({ rooms: roomList, uptime: process.uptime() });
});

// ── City database with population (in lakhs) ──────────────────────
const CITIES = [
  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777, pop: 1240 },
  { name: "Delhi", state: "Delhi", lat: 28.7041, lng: 77.1025, pop: 1100 },
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946, pop: 850 },
  { name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867, pop: 770 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, pop: 710 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, pop: 1490 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, pop: 560 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, pop: 500 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, pop: 310 },
  { name: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125, pop: 45 },
  { name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243, pop: 110 },
  { name: "Jaisalmer", state: "Rajasthan", lat: 26.9157, lng: 70.9083, pop: 7 },
  { name: "Ajmer", state: "Rajasthan", lat: 26.4499, lng: 74.6399, pop: 55 },
  { name: "Bikaner", state: "Rajasthan", lat: 28.0229, lng: 73.3119, pop: 65 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, pop: 280 },
  { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739, pop: 120 },
  { name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081, pop: 160 },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319, pop: 280 },
  { name: "Prayagraj", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463, pop: 120 },
  { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.391, pop: 64 },
  { name: "Gorakhpur", state: "Uttar Pradesh", lat: 26.7606, lng: 83.3732, pop: 68 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882, pop: 240 },
  { name: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898, pop: 150 },
  { name: "Aurangabad", state: "Maharashtra", lat: 19.8762, lng: 75.3433, pop: 117 },
  { name: "Kolhapur", state: "Maharashtra", lat: 16.705, lng: 74.2433, pop: 55 },
  { name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198, pop: 100 },
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558, pop: 160 },
  { name: "Pondicherry", state: "Puducherry", lat: 11.9416, lng: 79.8083, pop: 24 },
  { name: "Ooty", state: "Tamil Nadu", lat: 11.4102, lng: 76.695, pop: 9 },
  { name: "Kanyakumari", state: "Tamil Nadu", lat: 8.0883, lng: 77.5385, pop: 2 },
  { name: "Tiruchirappalli", state: "Tamil Nadu", lat: 10.7905, lng: 78.7047, pop: 85 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, pop: 68 },
  { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366, pop: 75 },
  { name: "Munnar", state: "Kerala", lat: 10.0889, lng: 77.0595, pop: 3 },
  { name: "Kozhikode", state: "Kerala", lat: 11.2588, lng: 75.7804, pop: 61 },
  { name: "Mysore", state: "Karnataka", lat: 12.2958, lng: 76.6394, pop: 90 },
  { name: "Mangalore", state: "Karnataka", lat: 12.9141, lng: 74.856, pop: 62 },
  { name: "Hampi", state: "Karnataka", lat: 15.335, lng: 76.46, pop: 1 },
  { name: "Hubli", state: "Karnataka", lat: 15.3647, lng: 75.124, pop: 94 },
  { name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311, pop: 450 },
  { name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812, pop: 170 },
  { name: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022, pop: 130 },
  { name: "Dwarka", state: "Gujarat", lat: 22.2442, lng: 68.9685, pop: 4 },
  { name: "Darjeeling", state: "West Bengal", lat: 27.036, lng: 88.2627, pop: 12 },
  { name: "Siliguri", state: "West Bengal", lat: 26.7271, lng: 88.3953, pop: 51 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, pop: 180 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577, pop: 200 },
  { name: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lng: 78.1828, pop: 110 },
  { name: "Ujjain", state: "Madhya Pradesh", lat: 23.1765, lng: 75.7885, pop: 52 },
  { name: "Patna", state: "Bihar", lat: 25.6093, lng: 85.1376, pop: 200 },
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096, pop: 110 },
  { name: "Jamshedpur", state: "Jharkhand", lat: 22.8046, lng: 86.2029, pop: 130 },
  { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245, pop: 84 },
  { name: "Puri", state: "Odisha", lat: 19.8135, lng: 85.8312, pop: 20 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185, pop: 170 },
  { name: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.648, pop: 105 },
  { name: "Tirupati", state: "Andhra Pradesh", lat: 13.6288, lng: 79.4192, pop: 37 },
  { name: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794, pop: 106 },
  { name: "Amritsar", state: "Punjab", lat: 31.634, lng: 74.8723, pop: 110 },
  { name: "Ludhiana", state: "Punjab", lat: 30.901, lng: 75.8573, pop: 160 },
  { name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266, pop: 88 },
  { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734, pop: 17 },
  { name: "Manali", state: "Himachal Pradesh", lat: 32.2396, lng: 77.1887, pop: 1 },
  { name: "Dharamshala", state: "Himachal Pradesh", lat: 32.219, lng: 76.3234, pop: 5 },
  { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322, pop: 58 },
  { name: "Rishikesh", state: "Uttarakhand", lat: 30.0869, lng: 78.2676, pop: 10 },
  { name: "Haridwar", state: "Uttarakhand", lat: 29.9457, lng: 78.1642, pop: 23 },
  { name: "Nainital", state: "Uttarakhand", lat: 29.3803, lng: 79.4636, pop: 4 },
  { name: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973, pop: 119 },
  { name: "Leh", state: "Ladakh", lat: 34.1526, lng: 77.5771, pop: 3 },
  { name: "Jammu", state: "Jammu & Kashmir", lat: 32.7266, lng: 74.857, pop: 50 },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, pop: 96 },
  { name: "Shillong", state: "Meghalaya", lat: 25.5788, lng: 91.8933, pop: 35 },
  { name: "Imphal", state: "Manipur", lat: 24.817, lng: 93.9368, pop: 27 },
  { name: "Gangtok", state: "Sikkim", lat: 27.3389, lng: 88.6065, pop: 10 },
  { name: "Panaji", state: "Goa", lat: 15.4909, lng: 73.8278, pop: 11 },
  { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296, pop: 101 },
  { name: "Port Blair", state: "Andaman & Nicobar", lat: 11.6234, lng: 92.7265, pop: 10 },
  { name: "Warangal", state: "Telangana", lat: 17.9784, lng: 79.5941, pop: 81 },
  { name: "Kodaikanal", state: "Tamil Nadu", lat: 10.2381, lng: 77.4892, pop: 4 },
  { name: "Alleppey", state: "Kerala", lat: 9.4981, lng: 76.3388, pop: 17 },
  { name: "Rameswaram", state: "Tamil Nadu", lat: 9.2876, lng: 79.3129, pop: 4 },
  { name: "Khajuraho", state: "Madhya Pradesh", lat: 24.8318, lng: 79.9199, pop: 2 },
  { name: "Bodh Gaya", state: "Bihar", lat: 24.6961, lng: 84.9911, pop: 5 },
  { name: "Konark", state: "Odisha", lat: 19.8876, lng: 86.0945, pop: 2 },
  { name: "Kutch", state: "Gujarat", lat: 23.7337, lng: 69.8597, pop: 3 },
  { name: "Tawang", state: "Arunachal Pradesh", lat: 27.5861, lng: 91.8594, pop: 1 },
  { name: "Kohima", state: "Nagaland", lat: 25.6751, lng: 94.1086, pop: 10 },
];

// ── River data (waypoints along major rivers) ─────────────────────
const RIVERS = [
  { name: "Ganga", waypoints: [[30.99,78.94],[29.95,78.16],[27.18,78.01],[26.85,80.95],[25.43,81.85],[25.32,82.97],[25.61,85.14],[22.57,88.36]] },
  { name: "Yamuna", waypoints: [[31.01,78.45],[30.38,77.87],[28.70,77.10],[27.18,78.01],[26.85,80.95],[25.43,81.85]] },
  { name: "Brahmaputra", waypoints: [[28.22,95.35],[27.47,94.87],[26.58,93.17],[26.14,91.74],[25.96,89.98]] },
  { name: "Godavari", waypoints: [[19.99,73.79],[19.88,75.34],[18.44,79.13],[17.38,78.49],[17.00,81.78],[16.56,82.24]] },
  { name: "Krishna", waypoints: [[17.92,73.66],[16.70,74.24],[15.37,76.46],[16.51,80.65],[16.06,81.13]] },
  { name: "Narmada", waypoints: [[22.67,81.75],[23.18,79.92],[23.26,77.41],[22.72,75.86],[22.31,73.18],[21.63,72.68]] },
  { name: "Kaveri", waypoints: [[12.42,75.49],[12.30,76.64],[12.42,77.67],[11.79,78.16],[10.79,78.70],[10.77,79.83]] },
  { name: "Indus", waypoints: [[34.15,77.58],[34.46,76.20],[34.08,74.80],[33.61,73.87]] },
  { name: "Tapti", waypoints: [[21.84,78.07],[21.52,76.64],[21.23,74.79],[21.17,72.83]] },
  { name: "Mahanadi", waypoints: [[21.70,81.90],[21.25,81.63],[20.83,83.01],[20.46,85.88],[20.30,86.62]] },
];

// ── State centers (for state-locator rounds) ──────────────────────
const STATES = [
  { name: "Rajasthan", lat: 26.58, lng: 73.82 },
  { name: "Maharashtra", lat: 19.66, lng: 75.30 },
  { name: "Tamil Nadu", lat: 11.13, lng: 78.66 },
  { name: "Kerala", lat: 10.16, lng: 76.64 },
  { name: "Karnataka", lat: 14.68, lng: 75.71 },
  { name: "Gujarat", lat: 22.31, lng: 71.19 },
  { name: "Uttar Pradesh", lat: 27.13, lng: 80.86 },
  { name: "Madhya Pradesh", lat: 23.47, lng: 77.95 },
  { name: "West Bengal", lat: 23.85, lng: 87.85 },
  { name: "Punjab", lat: 31.15, lng: 75.34 },
  { name: "Bihar", lat: 25.68, lng: 85.61 },
  { name: "Odisha", lat: 20.50, lng: 84.01 },
  { name: "Andhra Pradesh", lat: 15.91, lng: 79.74 },
  { name: "Telangana", lat: 17.92, lng: 79.09 },
  { name: "Assam", lat: 26.35, lng: 92.83 },
  { name: "Jharkhand", lat: 23.61, lng: 85.28 },
  { name: "Chhattisgarh", lat: 21.27, lng: 81.87 },
  { name: "Haryana", lat: 29.06, lng: 76.09 },
  { name: "Himachal Pradesh", lat: 31.90, lng: 77.16 },
  { name: "Uttarakhand", lat: 30.07, lng: 79.01 },
  { name: "Goa", lat: 15.38, lng: 73.96 },
  { name: "Jammu & Kashmir", lat: 33.78, lng: 76.58 },
  { name: "Sikkim", lat: 27.53, lng: 88.51 },
  { name: "Meghalaya", lat: 25.47, lng: 91.37 },
  { name: "Manipur", lat: 24.66, lng: 93.91 },
  { name: "Mizoram", lat: 23.16, lng: 92.94 },
  { name: "Nagaland", lat: 26.16, lng: 94.56 },
  { name: "Arunachal Pradesh", lat: 28.22, lng: 94.73 },
  { name: "Tripura", lat: 23.94, lng: 91.99 },
  { name: "Ladakh", lat: 34.23, lng: 77.61 },
];

// ── Helpers ────────────────────────────────────────────────────────
const rooms = new Map();

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distToPin(distKm) {
  return Math.max(0, Math.round(5000 * (1 - distKm / 2000)));
}

// Minimum distance from a point to any segment of a polyline
function distToRiver(lat, lng, waypoints) {
  let minDist = Infinity;
  for (let i = 0; i < waypoints.length; i++) {
    const d = haversineKm(lat, lng, waypoints[i][0], waypoints[i][1]);
    if (d < minDist) minDist = d;
  }
  // Also check midpoints between consecutive waypoints
  for (let i = 0; i < waypoints.length - 1; i++) {
    const midLat = (waypoints[i][0] + waypoints[i + 1][0]) / 2;
    const midLng = (waypoints[i][1] + waypoints[i + 1][1]) / 2;
    const d = haversineKm(lat, lng, midLat, midLng);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

// ── Round generation ──────────────────────────────────────────────
function generateRounds(n) {
  // Mix: 3 pin, 2 distance, 2 state, 1 river, 2 population
  const types = ["pin","pin","pin","distance","distance","state","state","river","population","population"];
  shuffle(types);
  const usedCities = new Set();
  const rounds = [];

  for (let i = 0; i < n; i++) {
    rounds.push(createRound(types[i], usedCities));
  }
  return rounds;
}

function pickUnusedCity(usedCities) {
  const available = CITIES.filter(c => !usedCities.has(c.name));
  if (available.length === 0) return CITIES[Math.floor(Math.random() * CITIES.length)];
  const city = available[Math.floor(Math.random() * available.length)];
  usedCities.add(city.name);
  return city;
}

function createRound(type, usedCities) {
  switch (type) {
    case "pin": {
      const city = pickUnusedCity(usedCities);
      return { type: "pin", city };
    }
    case "distance": {
      const c1 = pickUnusedCity(usedCities);
      let c2 = pickUnusedCity(usedCities);
      // Ensure they're at least 200km apart
      let tries = 0;
      while (haversineKm(c1.lat, c1.lng, c2.lat, c2.lng) < 200 && tries < 20) {
        c2 = pickUnusedCity(usedCities);
        tries++;
      }
      const actual = Math.round(haversineKm(c1.lat, c1.lng, c2.lat, c2.lng));
      return { type: "distance", city1: c1, city2: c2, actualDistance: actual };
    }
    case "state": {
      const state = STATES[Math.floor(Math.random() * STATES.length)];
      return { type: "state", state };
    }
    case "river": {
      const river = RIVERS[Math.floor(Math.random() * RIVERS.length)];
      return { type: "river", river };
    }
    case "population": {
      // Pick 4 cities with sufficiently different populations
      const pool = shuffle([...CITIES].filter(c => c.pop > 0)).slice(0, 20);
      const picked = [];
      const usedPops = new Set();
      for (const c of pool) {
        if (picked.length >= 4) break;
        // Skip if too close in population to already picked
        let tooClose = false;
        for (const p of picked) {
          if (Math.abs(p.pop - c.pop) < 10) { tooClose = true; break; }
        }
        if (!tooClose) picked.push(c);
      }
      // Sort by pop descending for correct answer
      const correctOrder = [...picked].sort((a, b) => b.pop - a.pop);
      return { type: "population", cities: correctOrder };
    }
  }
}

// ── Scoring per round type ────────────────────────────────────────
function scoreRound(round, guess) {
  switch (round.type) {
    case "pin": {
      if (!guess || guess.lat == null) return { pts: 0, dist: null };
      const dist = haversineKm(round.city.lat, round.city.lng, guess.lat, guess.lng);
      return { pts: distToPin(dist), dist: Math.round(dist) };
    }
    case "state": {
      if (!guess || guess.lat == null) return { pts: 0, dist: null };
      const dist = haversineKm(round.state.lat, round.state.lng, guess.lat, guess.lng);
      return { pts: distToPin(dist), dist: Math.round(dist) };
    }
    case "river": {
      if (!guess || guess.lat == null) return { pts: 0, dist: null };
      const dist = distToRiver(guess.lat, guess.lng, round.river.waypoints);
      // River scoring: 5000 at 0km, 0 at 500km+
      const pts = Math.max(0, Math.round(5000 * (1 - dist / 500)));
      return { pts, dist: Math.round(dist) };
    }
    case "distance": {
      if (!guess || guess.answer == null) return { pts: 0, dist: null };
      const actual = round.actualDistance;
      const est = guess.answer;
      const pctError = Math.abs(est - actual) / actual;
      // 5000 pts at 0% error, 0 at 100%+ error
      const pts = Math.max(0, Math.round(5000 * (1 - pctError)));
      return { pts, dist: Math.abs(est - actual) };
    }
    case "population": {
      if (!guess || !guess.order) return { pts: 0, dist: null };
      const correct = round.cities.map(c => c.name);
      const guessOrder = guess.order;
      // Score: 1250 pts per correct position
      let correctCount = 0;
      for (let i = 0; i < correct.length; i++) {
        if (guessOrder[i] === correct[i]) correctCount++;
      }
      return { pts: correctCount * 1250, dist: correctCount };
    }
  }
  return { pts: 0, dist: null };
}

// ── Broadcast helpers ─────────────────────────────────────────────
function broadcast(room, msg) {
  const data = JSON.stringify(msg);
  for (const p of room.players.values()) {
    if (p.ws.readyState === 1) p.ws.send(data);
  }
  if (room.host && room.host.readyState === 1) room.host.send(data);
}

function sendPlayerList(room) {
  const players = [...room.players.values()].map((p) => ({
    id: p.id, name: p.name, score: p.totalScore, connected: p.ws.readyState === 1,
  }));
  broadcast(room, { type: "playerList", players });
}

// ── WebSocket handling ────────────────────────────────────────────
wss.on("connection", (ws) => {
  console.log("[WS] New connection");
  let playerId = null;
  let roomCode = null;
  let isHost = false;

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === "createRoom") {
      const code = generateCode();
      const room = {
        code, host: ws, players: new Map(),
        rounds: generateRounds(10),
        currentRound: -1, guesses: new Map(),
        timerHandle: null, state: "lobby",
      };
      rooms.set(code, room);
      roomCode = code;
      isHost = true;
      console.log(`[ROOM] Created: ${code} | Total rooms: ${rooms.size}`);
      ws.send(JSON.stringify({ type: "roomCreated", code }));
    }

    if (msg.type === "joinRoom") {
      const tryCode = msg.code?.toUpperCase();
      console.log(`[JOIN] Trying: "${tryCode}" | Rooms: [${[...rooms.keys()].join(",")}]`);
      const room = rooms.get(tryCode);
      if (!room) return ws.send(JSON.stringify({ type: "error", msg: "Room not found" }));
      if (room.state !== "lobby") return ws.send(JSON.stringify({ type: "error", msg: "Game already started" }));
      playerId = Math.random().toString(36).slice(2, 10);
      roomCode = room.code;
      room.players.set(playerId, { id: playerId, name: msg.name || "Anon", ws, totalScore: 0 });
      ws.send(JSON.stringify({ type: "joined", playerId, code: room.code }));
      sendPlayerList(room);
    }

    if (msg.type === "startGame" && isHost) {
      const room = rooms.get(roomCode);
      if (!room || room.players.size === 0) return;
      nextRound(room);
    }

    if (msg.type === "nextRound" && isHost) {
      const room = rooms.get(roomCode);
      if (room) nextRound(room);
    }

    if (msg.type === "guess" && playerId) {
      const room = rooms.get(roomCode);
      if (!room || room.state !== "question") return;
      room.guesses.set(playerId, msg.data);
      if (room.host && room.host.readyState === 1) {
        room.host.send(JSON.stringify({ type: "guessCount", count: room.guesses.size, total: room.players.size }));
      }
      ws.send(JSON.stringify({ type: "guessAck" }));
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
  if (room.currentRound >= room.rounds.length) {
    room.state = "finished";
    const final = [...room.players.values()].map(p => ({ name: p.name, score: p.totalScore })).sort((a, b) => b.score - a.score);
    broadcast(room, { type: "gameOver", leaderboard: final });
    return;
  }

  room.state = "question";
  room.guesses = new Map();
  const round = room.rounds[room.currentRound];

  // Build the message to send to clients
  const roundMsg = {
    type: "newRound",
    round: room.currentRound + 1,
    total: room.rounds.length,
    roundType: round.type,
    timeLimit: 20,
  };

  switch (round.type) {
    case "pin":
      roundMsg.city = round.city.name;
      roundMsg.state = round.city.state;
      break;
    case "distance":
      roundMsg.city1 = { name: round.city1.name, state: round.city1.state };
      roundMsg.city2 = { name: round.city2.name, state: round.city2.state };
      break;
    case "state":
      roundMsg.stateName = round.state.name;
      break;
    case "river":
      roundMsg.riverName = round.river.name;
      break;
    case "population":
      // Send cities in shuffled order (not sorted)
      roundMsg.cities = shuffle([...round.cities]).map(c => ({ name: c.name, state: c.state }));
      break;
  }

  broadcast(room, roundMsg);
  room.timerHandle = setTimeout(() => endRound(room), 21000);
}

function endRound(room) {
  room.state = "results";
  const round = room.rounds[room.currentRound];
  const results = [];

  for (const [pid, player] of room.players) {
    const guess = room.guesses.get(pid);
    const { pts, dist } = scoreRound(round, guess);
    player.totalScore += pts;
    results.push({
      id: pid, name: player.name,
      guess: guess ?? null,
      distance: dist, roundScore: pts, totalScore: player.totalScore,
    });
  }

  results.sort((a, b) => b.roundScore - a.roundScore);

  // Build answer data for results display
  const answer = {};
  switch (round.type) {
    case "pin":
      answer.lat = round.city.lat; answer.lng = round.city.lng;
      answer.label = `${round.city.name}, ${round.city.state}`;
      break;
    case "state":
      answer.lat = round.state.lat; answer.lng = round.state.lng;
      answer.label = round.state.name;
      break;
    case "river":
      answer.waypoints = round.river.waypoints;
      answer.label = round.river.name;
      break;
    case "distance":
      answer.actualDistance = round.actualDistance;
      answer.label = `${round.city1.name} to ${round.city2.name}`;
      answer.city1 = { lat: round.city1.lat, lng: round.city1.lng };
      answer.city2 = { lat: round.city2.lat, lng: round.city2.lng };
      break;
    case "population":
      answer.correctOrder = round.cities.map(c => ({ name: c.name, pop: c.pop }));
      answer.label = "Population ranking";
      break;
  }

  broadcast(room, {
    type: "roundResults",
    round: room.currentRound + 1,
    total: room.rounds.length,
    roundType: round.type,
    answer,
    results,
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n  🇮🇳 GeoPin India is running at http://localhost:${PORT}\n`);
});
