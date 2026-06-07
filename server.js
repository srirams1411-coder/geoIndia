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
    mode: room.mode,
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
  { name: "Ganga", waypoints: [[30.99,78.94],[30.09,78.27],[29.95,78.16],[28.68,78.05],[27.18,78.01],[26.85,80.95],[25.97,81.34],[25.43,81.85],[25.32,82.97],[25.61,85.14],[24.79,87.95],[22.57,88.36]] },
  { name: "Yamuna", waypoints: [[31.01,78.45],[30.38,77.87],[30.32,77.99],[29.58,77.70],[28.70,77.10],[27.50,77.68],[27.18,78.01],[26.85,80.95],[25.43,81.85]] },
  { name: "Brahmaputra", waypoints: [[28.22,95.35],[27.90,95.00],[27.47,94.87],[27.10,94.20],[26.58,93.17],[26.14,91.74],[26.10,90.60],[25.96,89.98]] },
  { name: "Godavari", waypoints: [[19.99,73.79],[19.88,75.34],[19.10,77.28],[18.44,79.13],[17.38,78.49],[17.00,81.78],[16.74,81.69],[16.56,82.24]] },
  { name: "Krishna", waypoints: [[17.92,73.66],[16.70,74.24],[16.18,75.60],[15.37,76.46],[15.83,78.10],[16.51,80.65],[16.06,81.13]] },
  { name: "Narmada", waypoints: [[22.67,81.75],[22.52,80.30],[23.18,79.92],[23.26,77.41],[22.72,75.86],[22.31,73.18],[21.63,72.68]] },
  { name: "Kaveri", waypoints: [[12.42,75.49],[12.30,76.64],[12.42,77.67],[11.95,77.56],[11.79,78.16],[11.10,78.85],[10.79,78.70],[10.77,79.83]] },
  { name: "Indus", waypoints: [[34.15,77.58],[34.46,76.20],[34.08,74.80],[33.61,73.87],[32.73,74.86]] },
  { name: "Tapti", waypoints: [[21.84,78.07],[21.52,76.64],[21.23,74.79],[21.17,72.83]] },
  { name: "Mahanadi", waypoints: [[21.70,81.90],[21.25,81.63],[20.83,83.01],[20.46,85.88],[20.30,86.62]] },
];

// ── Metro city data (for city-specific mode) ─────────────────────
const METROS = {
  mumbai: {
    name: "Mumbai",
    center: [19.076, 72.8777],
    zoom: 11,
    landmarks: [
      { name: "Gateway of India", lat: 18.9220, lng: 72.8347, pop: 5 },
      { name: "Bandra-Worli Sea Link", lat: 19.0380, lng: 72.8162, pop: 3 },
      { name: "Chhatrapati Shivaji Terminus", lat: 18.9398, lng: 72.8355, pop: 4 },
      { name: "Marine Drive", lat: 18.9432, lng: 72.8235, pop: 6 },
      { name: "Haji Ali Dargah", lat: 18.9827, lng: 72.8090, pop: 2 },
      { name: "Powai Lake", lat: 19.1273, lng: 72.9060, pop: 3 },
      { name: "Juhu Beach", lat: 19.0948, lng: 72.8267, pop: 4 },
      { name: "Sanjay Gandhi National Park", lat: 19.2147, lng: 72.9107, pop: 1 },
      { name: "Dharavi", lat: 19.0420, lng: 72.8517, pop: 100 },
      { name: "Andheri Station", lat: 19.1197, lng: 72.8464, pop: 50 },
      { name: "Dadar", lat: 19.0178, lng: 72.8478, pop: 45 },
      { name: "Colaba", lat: 18.9067, lng: 72.8147, pop: 10 },
      { name: "Borivali", lat: 19.2307, lng: 72.8567, pop: 35 },
      { name: "Thane", lat: 19.2183, lng: 72.9781, pop: 120 },
      { name: "Navi Mumbai", lat: 19.0330, lng: 73.0297, pop: 115 },
      { name: "Bandra", lat: 19.0596, lng: 72.8295, pop: 40 },
      { name: "Churchgate", lat: 18.9322, lng: 72.8264, pop: 8 },
      { name: "Goregaon", lat: 19.1663, lng: 72.8526, pop: 30 },
      { name: "Malad", lat: 19.1874, lng: 72.8484, pop: 28 },
      { name: "Versova", lat: 19.1340, lng: 72.8140, pop: 15 },
    ],
    rivers: [
      { name: "Mithi River", waypoints: [[19.08,72.88],[19.06,72.87],[19.05,72.86],[19.03,72.85],[19.01,72.84],[18.99,72.83]] },
    ],
  },
  delhi: {
    name: "Delhi",
    center: [28.6139, 77.2090],
    zoom: 11,
    landmarks: [
      { name: "India Gate", lat: 28.6129, lng: 77.2295, pop: 3 },
      { name: "Red Fort", lat: 28.6562, lng: 77.2410, pop: 5 },
      { name: "Qutub Minar", lat: 28.5245, lng: 77.1855, pop: 4 },
      { name: "Lotus Temple", lat: 28.5535, lng: 77.2588, pop: 2 },
      { name: "Humayun's Tomb", lat: 28.5933, lng: 77.2507, pop: 3 },
      { name: "Connaught Place", lat: 28.6315, lng: 77.2167, pop: 40 },
      { name: "Chandni Chowk", lat: 28.6506, lng: 77.2303, pop: 60 },
      { name: "Hauz Khas", lat: 28.5494, lng: 77.2001, pop: 25 },
      { name: "Dwarka", lat: 28.5921, lng: 77.0460, pop: 50 },
      { name: "Rohini", lat: 28.7495, lng: 77.0565, pop: 45 },
      { name: "Karol Bagh", lat: 28.6517, lng: 77.1908, pop: 35 },
      { name: "Lajpat Nagar", lat: 28.5700, lng: 77.2400, pop: 30 },
      { name: "Janakpuri", lat: 28.6219, lng: 77.0815, pop: 28 },
      { name: "Saket", lat: 28.5244, lng: 77.2117, pop: 20 },
      { name: "Rashtrapati Bhavan", lat: 28.6143, lng: 77.1994, pop: 1 },
      { name: "AIIMS", lat: 28.5672, lng: 77.2100, pop: 5 },
      { name: "Nehru Place", lat: 28.5491, lng: 77.2533, pop: 15 },
      { name: "Sarojini Nagar", lat: 28.5770, lng: 77.2010, pop: 22 },
      { name: "Pitampura", lat: 28.7069, lng: 77.1316, pop: 32 },
      { name: "Mayur Vihar", lat: 28.5967, lng: 77.2988, pop: 38 },
    ],
    rivers: [
      { name: "Yamuna (Delhi stretch)", waypoints: [[28.77,77.21],[28.72,77.22],[28.68,77.23],[28.65,77.24],[28.61,77.25],[28.57,77.26],[28.52,77.28],[28.48,77.30]] },
    ],
  },
  bangalore: {
    name: "Bangalore",
    center: [12.9716, 77.5946],
    zoom: 11,
    landmarks: [
      { name: "Vidhana Soudha", lat: 12.9793, lng: 77.5913, pop: 5 },
      { name: "Cubbon Park", lat: 12.9763, lng: 77.5929, pop: 3 },
      { name: "Lalbagh Botanical Garden", lat: 12.9507, lng: 77.5848, pop: 4 },
      { name: "Bangalore Palace", lat: 12.9988, lng: 77.5921, pop: 2 },
      { name: "MG Road", lat: 12.9758, lng: 77.6045, pop: 25 },
      { name: "Whitefield", lat: 12.9698, lng: 77.7500, pop: 60 },
      { name: "Electronic City", lat: 12.8450, lng: 77.6602, pop: 55 },
      { name: "Koramangala", lat: 12.9352, lng: 77.6245, pop: 40 },
      { name: "Indiranagar", lat: 12.9719, lng: 77.6412, pop: 35 },
      { name: "HSR Layout", lat: 12.9116, lng: 77.6474, pop: 30 },
      { name: "Yelahanka", lat: 13.1007, lng: 77.5963, pop: 28 },
      { name: "Jayanagar", lat: 12.9308, lng: 77.5838, pop: 32 },
      { name: "Marathahalli", lat: 12.9591, lng: 77.7009, pop: 38 },
      { name: "Banashankari", lat: 12.9256, lng: 77.5468, pop: 27 },
      { name: "Hebbal", lat: 13.0358, lng: 77.5970, pop: 22 },
      { name: "BTM Layout", lat: 12.9166, lng: 77.6101, pop: 26 },
      { name: "JP Nagar", lat: 12.9063, lng: 77.5857, pop: 24 },
      { name: "Rajajinagar", lat: 12.9915, lng: 77.5560, pop: 20 },
      { name: "Bellandur Lake", lat: 12.9260, lng: 77.6700, pop: 10 },
      { name: "ISRO HQ", lat: 12.9493, lng: 77.5675, pop: 2 },
    ],
    rivers: [
      { name: "Vrishabhavathi River", waypoints: [[12.98,77.54],[12.96,77.55],[12.94,77.56],[12.92,77.57],[12.89,77.59],[12.86,77.61]] },
    ],
  },
  chennai: {
    name: "Chennai",
    center: [13.0827, 80.2707],
    zoom: 11,
    landmarks: [
      { name: "Marina Beach", lat: 13.0500, lng: 80.2824, pop: 10 },
      { name: "Fort St. George", lat: 13.0800, lng: 80.2878, pop: 3 },
      { name: "Kapaleeshwarar Temple", lat: 13.0339, lng: 80.2695, pop: 5 },
      { name: "T Nagar", lat: 13.0418, lng: 80.2341, pop: 45 },
      { name: "Anna Nagar", lat: 13.0850, lng: 80.2101, pop: 38 },
      { name: "Adyar", lat: 13.0012, lng: 80.2565, pop: 30 },
      { name: "Velachery", lat: 12.9815, lng: 80.2180, pop: 35 },
      { name: "Guindy", lat: 13.0067, lng: 80.2206, pop: 25 },
      { name: "OMR (IT Corridor)", lat: 12.9100, lng: 80.2273, pop: 50 },
      { name: "Mylapore", lat: 13.0368, lng: 80.2676, pop: 20 },
      { name: "Tambaram", lat: 12.9249, lng: 80.1000, pop: 42 },
      { name: "Porur", lat: 13.0382, lng: 80.1558, pop: 22 },
      { name: "Besant Nagar", lat: 13.0002, lng: 80.2707, pop: 15 },
      { name: "Perambur", lat: 13.1186, lng: 80.2340, pop: 28 },
      { name: "Chromepet", lat: 12.9516, lng: 80.1462, pop: 32 },
      { name: "IIT Madras", lat: 12.9915, lng: 80.2337, pop: 5 },
      { name: "Nungambakkam", lat: 13.0569, lng: 80.2425, pop: 18 },
      { name: "Egmore", lat: 13.0732, lng: 80.2609, pop: 16 },
      { name: "Sholinganallur", lat: 12.9010, lng: 80.2279, pop: 27 },
      { name: "Ambattur", lat: 13.1143, lng: 80.1548, pop: 33 },
    ],
    rivers: [
      { name: "Adyar River", waypoints: [[13.06,80.17],[13.04,80.19],[13.02,80.22],[13.00,80.25],[12.99,80.27]] },
      { name: "Cooum River", waypoints: [[13.12,80.12],[13.10,80.15],[13.08,80.20],[13.07,80.24],[13.07,80.28]] },
    ],
  },
  kolkata: {
    name: "Kolkata",
    center: [22.5726, 88.3639],
    zoom: 11,
    landmarks: [
      { name: "Victoria Memorial", lat: 22.5448, lng: 88.3426, pop: 3 },
      { name: "Howrah Bridge", lat: 22.5851, lng: 88.3468, pop: 5 },
      { name: "Park Street", lat: 22.5521, lng: 88.3587, pop: 25 },
      { name: "Salt Lake City", lat: 22.5958, lng: 88.4103, pop: 45 },
      { name: "New Town", lat: 22.5958, lng: 88.4800, pop: 40 },
      { name: "Kalighat", lat: 22.5208, lng: 88.3440, pop: 20 },
      { name: "Esplanade", lat: 22.5643, lng: 88.3523, pop: 30 },
      { name: "Jadavpur", lat: 22.4988, lng: 88.3714, pop: 35 },
      { name: "Dum Dum", lat: 22.6378, lng: 88.4271, pop: 28 },
      { name: "Ballygunge", lat: 22.5275, lng: 88.3630, pop: 22 },
      { name: "College Street", lat: 22.5763, lng: 88.3638, pop: 15 },
      { name: "Science City", lat: 22.5399, lng: 88.3963, pop: 3 },
      { name: "Dakshineswar Temple", lat: 22.6552, lng: 88.3575, pop: 4 },
      { name: "Behala", lat: 22.4883, lng: 88.3150, pop: 32 },
      { name: "Tollygunge", lat: 22.4981, lng: 88.3475, pop: 26 },
      { name: "Barrackpore", lat: 22.7580, lng: 88.3677, pop: 18 },
      { name: "Gariahat", lat: 22.5181, lng: 88.3683, pop: 20 },
      { name: "Belur Math", lat: 22.6320, lng: 88.3512, pop: 2 },
      { name: "Newmarket", lat: 22.5560, lng: 88.3504, pop: 12 },
      { name: "Garia", lat: 22.4648, lng: 88.3847, pop: 24 },
    ],
    rivers: [
      { name: "Hooghly River (Kolkata stretch)", waypoints: [[22.76,88.36],[22.72,88.35],[22.66,88.35],[22.59,88.35],[22.55,88.34],[22.50,88.32],[22.46,88.30]] },
    ],
  },
  hyderabad: {
    name: "Hyderabad",
    center: [17.385, 78.4867],
    zoom: 11,
    landmarks: [
      { name: "Charminar", lat: 17.3616, lng: 78.4747, pop: 8 },
      { name: "Golconda Fort", lat: 17.3833, lng: 78.4011, pop: 3 },
      { name: "HITEC City", lat: 17.4435, lng: 78.3772, pop: 55 },
      { name: "Hussain Sagar Lake", lat: 17.4239, lng: 78.4738, pop: 2 },
      { name: "Banjara Hills", lat: 17.4138, lng: 78.4456, pop: 30 },
      { name: "Jubilee Hills", lat: 17.4325, lng: 78.4070, pop: 28 },
      { name: "Secunderabad", lat: 17.4399, lng: 78.4983, pop: 45 },
      { name: "Gachibowli", lat: 17.4401, lng: 78.3489, pop: 40 },
      { name: "Madhapur", lat: 17.4486, lng: 78.3908, pop: 35 },
      { name: "Kukatpally", lat: 17.4849, lng: 78.4138, pop: 38 },
      { name: "Ameerpet", lat: 17.4375, lng: 78.4483, pop: 22 },
      { name: "Begumpet", lat: 17.4430, lng: 78.4679, pop: 18 },
      { name: "LB Nagar", lat: 17.3457, lng: 78.5522, pop: 32 },
      { name: "Miyapur", lat: 17.4952, lng: 78.3544, pop: 25 },
      { name: "Uppal", lat: 17.4012, lng: 78.5592, pop: 20 },
      { name: "Dilsukhnagar", lat: 17.3688, lng: 78.5247, pop: 27 },
      { name: "Shamshabad (Airport)", lat: 17.2403, lng: 78.4294, pop: 10 },
      { name: "Film City (Ramoji)", lat: 17.2543, lng: 78.6808, pop: 2 },
      { name: "Chowmahalla Palace", lat: 17.3580, lng: 78.4718, pop: 3 },
      { name: "Mecca Masjid", lat: 17.3604, lng: 78.4736, pop: 4 },
    ],
    rivers: [
      { name: "Musi River", waypoints: [[17.39,78.33],[17.38,78.38],[17.37,78.43],[17.36,78.48],[17.35,78.53],[17.34,78.58]] },
    ],
  },
};

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

function distToPin(distKm, maxDist = 2000) {
  return Math.max(0, Math.round(5000 * (1 - distKm / maxDist)));
}

// Average distance from a user-drawn polyline to actual river waypoints
// Uses "coverage" scoring: how close each actual waypoint is to the nearest drawn point
function scoreRiverTrace(drawnPoints, actualWaypoints) {
  if (!drawnPoints || drawnPoints.length < 2) return { pts: 0, avgDist: null };

  let totalDist = 0;
  for (const wp of actualWaypoints) {
    let minD = Infinity;
    for (const dp of drawnPoints) {
      const d = haversineKm(wp[0], wp[1], dp[0], dp[1]);
      if (d < minD) minD = d;
    }
    totalDist += minD;
  }
  const avgDist = totalDist / actualWaypoints.length;
  // Also penalize length difference (user drew too short)
  const drawnLength = polylineLength(drawnPoints);
  const actualLength = polylineLength(actualWaypoints);
  const lengthRatio = Math.min(drawnLength / actualLength, 1.0); // cap at 1

  // Score: base accuracy (avg dist) * coverage bonus
  const accuracyPts = Math.max(0, 5000 * (1 - avgDist / 300)); // 0 pts at 300km avg dist
  const pts = Math.round(accuracyPts * (0.5 + 0.5 * lengthRatio)); // halved if very short trace
  return { pts: Math.max(0, pts), avgDist: Math.round(avgDist) };
}

function polylineLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += haversineKm(points[i-1][0], points[i-1][1], points[i][0], points[i][1]);
  }
  return len;
}

// Score population circle: user draws a circle (center+radius), we count cities inside
// and compare total pop to target
function scorePopCircle(guess, targetPop, cityPool) {
  if (!guess || guess.lat == null || guess.radius == null) return { pts: 0, captured: 0 };

  let capturedPop = 0;
  let capturedCount = 0;
  for (const c of cityPool) {
    const d = haversineKm(guess.lat, guess.lng, c.lat, c.lng);
    if (d <= guess.radius) {
      capturedPop += c.pop;
      capturedCount++;
    }
  }

  // Score based on how close captured pop is to target
  const diff = Math.abs(capturedPop - targetPop);
  const pctError = diff / targetPop;
  // Also penalize oversized circles (radius penalty)
  const radiusPenalty = Math.min(1, 500 / Math.max(guess.radius, 1)); // no penalty under 500km
  const pts = Math.max(0, Math.round(5000 * (1 - pctError) * Math.min(1, radiusPenalty)));
  return { pts: Math.max(0, pts), captured: capturedPop, count: capturedCount };
}

// ── Round generation ──────────────────────────────────────────────
function generateRounds(n, mode) {
  // Mode: "india" (all-india) or a metro key like "mumbai"
  if (mode !== "india" && METROS[mode]) {
    return generateMetroRounds(n, mode);
  }

  // All-India: 3 pin, 2 distance, 2 river-trace, 1 pop-circle, 2 population-rank
  const types = ["pin","pin","pin","distance","distance","river","river","popCircle","population","population"];
  shuffle(types);
  const usedCities = new Set();
  const rounds = [];
  for (let i = 0; i < n; i++) {
    rounds.push(createRound(types[i], usedCities, "india"));
  }
  return rounds;
}

function generateMetroRounds(n, metroKey) {
  const metro = METROS[metroKey];
  // For metro: 3 pin (landmarks), 2 distance, 2 river-trace, 1 pop-circle, 2 population-rank
  const types = ["pin","pin","pin","distance","distance","river","river","popCircle","population","population"];
  shuffle(types);
  const usedLandmarks = new Set();
  const rounds = [];
  for (let i = 0; i < n; i++) {
    rounds.push(createMetroRound(types[i], metro, usedLandmarks));
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

function pickUnusedLandmark(metro, usedLandmarks) {
  const available = metro.landmarks.filter(l => !usedLandmarks.has(l.name));
  if (available.length === 0) return metro.landmarks[Math.floor(Math.random() * metro.landmarks.length)];
  const lm = available[Math.floor(Math.random() * available.length)];
  usedLandmarks.add(lm.name);
  return lm;
}

function createRound(type, usedCities, mode) {
  switch (type) {
    case "pin": {
      const city = pickUnusedCity(usedCities);
      return { type: "pin", city };
    }
    case "distance": {
      const c1 = pickUnusedCity(usedCities);
      let c2 = pickUnusedCity(usedCities);
      let tries = 0;
      while (haversineKm(c1.lat, c1.lng, c2.lat, c2.lng) < 200 && tries < 20) {
        c2 = pickUnusedCity(usedCities);
        tries++;
      }
      const actual = Math.round(haversineKm(c1.lat, c1.lng, c2.lat, c2.lng));
      return { type: "distance", city1: c1, city2: c2, actualDistance: actual };
    }
    case "river": {
      const river = RIVERS[Math.floor(Math.random() * RIVERS.length)];
      return { type: "river", river };
    }
    case "popCircle": {
      // Pick a target population that makes sense (sum of a few nearby cities)
      // Target is between 200-800 lakhs for all-India
      const targetPop = Math.round((200 + Math.random() * 600) / 10) * 10;
      return { type: "popCircle", targetPop, cityPool: CITIES };
    }
    case "population": {
      const pool = shuffle([...CITIES].filter(c => c.pop > 0)).slice(0, 20);
      const picked = [];
      for (const c of pool) {
        if (picked.length >= 4) break;
        let tooClose = false;
        for (const p of picked) {
          if (Math.abs(p.pop - c.pop) < 10) { tooClose = true; break; }
        }
        if (!tooClose) picked.push(c);
      }
      const correctOrder = [...picked].sort((a, b) => b.pop - a.pop);
      return { type: "population", cities: correctOrder };
    }
  }
}

function createMetroRound(type, metro, usedLandmarks) {
  switch (type) {
    case "pin": {
      const lm = pickUnusedLandmark(metro, usedLandmarks);
      return { type: "pin", city: lm, metroName: metro.name };
    }
    case "distance": {
      const l1 = pickUnusedLandmark(metro, usedLandmarks);
      const l2 = pickUnusedLandmark(metro, usedLandmarks);
      const actual = Math.round(haversineKm(l1.lat, l1.lng, l2.lat, l2.lng) * 10) / 10; // in km, 1 decimal
      return { type: "distance", city1: l1, city2: l2, actualDistance: actual, isMetro: true };
    }
    case "river": {
      const river = metro.rivers[Math.floor(Math.random() * metro.rivers.length)];
      return { type: "river", river, isMetro: true };
    }
    case "popCircle": {
      // For metro mode, target pop in lakhs (lower range)
      const targetPop = Math.round((30 + Math.random() * 150) / 5) * 5;
      return { type: "popCircle", targetPop, cityPool: metro.landmarks, isMetro: true };
    }
    case "population": {
      const pool = shuffle([...metro.landmarks].filter(l => l.pop > 0)).slice(0, 12);
      const picked = [];
      for (const c of pool) {
        if (picked.length >= 4) break;
        let tooClose = false;
        for (const p of picked) {
          if (Math.abs(p.pop - c.pop) < 3) { tooClose = true; break; }
        }
        if (!tooClose) picked.push(c);
      }
      if (picked.length < 4) picked.push(...pool.slice(0, 4 - picked.length));
      const correctOrder = [...picked].sort((a, b) => b.pop - a.pop);
      return { type: "population", cities: correctOrder, isMetro: true };
    }
  }
}

// ── Scoring per round type ────────────────────────────────────────
function scoreRound(round, guess) {
  switch (round.type) {
    case "pin": {
      if (!guess || guess.lat == null) return { pts: 0, dist: null };
      const dist = haversineKm(round.city.lat, round.city.lng, guess.lat, guess.lng);
      const maxDist = round.metroName ? 50 : 2000; // tighter scoring for metro
      return { pts: distToPin(dist, maxDist), dist: Math.round(dist * (round.metroName ? 10 : 1)) / (round.metroName ? 10 : 1) };
    }
    case "river": {
      const result = scoreRiverTrace(guess?.points, round.river.waypoints);
      return { pts: result.pts, dist: result.avgDist };
    }
    case "distance": {
      if (!guess || guess.answer == null) return { pts: 0, dist: null };
      const actual = round.actualDistance;
      const est = guess.answer;
      const pctError = Math.abs(est - actual) / actual;
      const pts = Math.max(0, Math.round(5000 * (1 - pctError)));
      return { pts, dist: Math.round(Math.abs(est - actual) * 10) / 10 };
    }
    case "popCircle": {
      const result = scorePopCircle(guess, round.targetPop, round.cityPool);
      return { pts: result.pts, dist: result.captured };
    }
    case "population": {
      if (!guess || !guess.order) return { pts: 0, dist: null };
      const correct = round.cities.map(c => c.name);
      const guessOrder = guess.order;
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
      const mode = msg.mode || "india"; // "india" or metro key
      const room = {
        code, host: ws, players: new Map(),
        rounds: generateRounds(10, mode),
        currentRound: -1, guesses: new Map(),
        timerHandle: null, state: "lobby",
        mode,
      };
      rooms.set(code, room);
      roomCode = code;
      isHost = true;
      console.log(`[ROOM] Created: ${code} | Mode: ${mode} | Total rooms: ${rooms.size}`);
      ws.send(JSON.stringify({ type: "roomCreated", code, mode }));
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
      ws.send(JSON.stringify({ type: "joined", playerId, code: room.code, mode: room.mode }));
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

  const roundMsg = {
    type: "newRound",
    round: room.currentRound + 1,
    total: room.rounds.length,
    roundType: round.type,
    timeLimit: round.type === "river" ? 30 : 20, // extra time for river tracing
  };

  switch (round.type) {
    case "pin":
      roundMsg.city = round.city.name;
      roundMsg.state = round.city.state || "";
      roundMsg.metroName = round.metroName || null;
      break;
    case "distance":
      roundMsg.city1 = { name: round.city1.name, state: round.city1.state || "" };
      roundMsg.city2 = { name: round.city2.name, state: round.city2.state || "" };
      roundMsg.isMetro = round.isMetro || false;
      break;
    case "river":
      roundMsg.riverName = round.river.name;
      roundMsg.isMetro = round.isMetro || false;
      break;
    case "popCircle":
      roundMsg.targetPop = round.targetPop;
      roundMsg.isMetro = round.isMetro || false;
      break;
    case "population":
      roundMsg.cities = shuffle([...round.cities]).map(c => ({ name: c.name, state: c.state || "" }));
      roundMsg.isMetro = round.isMetro || false;
      break;
  }

  broadcast(room, roundMsg);
  room.timerHandle = setTimeout(() => endRound(room), (roundMsg.timeLimit + 1) * 1000);
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
      answer.label = round.metroName ? round.city.name : `${round.city.name}, ${round.city.state}`;
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
    case "popCircle":
      answer.targetPop = round.targetPop;
      answer.label = `Target: ${round.targetPop} lakh`;
      // Send city positions for visualization
      answer.cities = round.cityPool.map(c => ({ lat: c.lat, lng: c.lng, pop: c.pop, name: c.name }));
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
