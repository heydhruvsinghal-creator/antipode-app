const socket = io(); // Connect to backend
const btnLocate = document.getElementById('btn-locate');
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');
const searchText = document.getElementById('search-text');
const partnerLoc = document.getElementById('partner-location');
const partnerDist = document.getElementById('partner-distance');

// 1. Get User Location
btnLocate.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    step1.classList.add('hidden');
    step2.classList.remove('hidden');

    navigator.geolocation.getCurrentPosition(success, error);
});

function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    // 2. Calculate Antipode (Opposite side of earth)
    // Formula: Lat' = -Lat, Lon' = Lon - 180 (if positive) or + 180 (if negative)
    const antipodeLat = -lat;
    const antipodeLon = lon > 0 ? lon - 180 : lon + 180;

    searchText.innerText = `Calculating coordinates: ${antipodeLat.toFixed(4)}, ${antipodeLon.toFixed(4)}`;

    // 3. Check if Ocean (Mock Logic for Prototype)
    // In a real app, you would send these coords to a Geocoding API (like Google Maps)
    // to see if it's land. Here we simulate a delay and a random "Land" match.
    
    setTimeout(() => {
        // Simulate finding a user
        const mockPartner = {
            lat: antipodeLat + (Math.random() * 0.5 - 0.25), // Slight offset
            lon: antipodeLon + (Math.random() * 0.5 - 0.25),
            name: "Traveler"
        };

        // Calculate distance between user and partner
        const distance = geolib.getDistance(
            { latitude: lat, longitude: lon },
            { latitude: mockPartner.lat, longitude: mockPartner.lon }
        );

        // Update UI
        partnerLoc.innerText = `Location: Near ${mockPartner.lat.toFixed(2)}, ${mockPartner.lon.toFixed(2)}`;
        partnerDist.innerText = `Distance: ${Math.round(distance / 1000)} km away`;

        step2.classList.add('hidden');
        step3.classList.remove('hidden');

        // Join a specific room based on the antipode coordinates
        const roomName = `antipode_${antipodeLat.toFixed(2)}_${antipodeLon.toFixed(2)}`;
        socket.emit('join_room', roomName);

    }, 1000); // 2 second delay for effect
}

function error() {
    alert("Unable to retrieve your location. Please enable GPS.");
}

// 4. Chat Logic
const chatBox = document.getElementById('chat-box');
const input = document.getElementById('message-input');
const btnSend = document.getElementById('btn-send');

function appendMessage(sender, text) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(sender === 'me' ? 'outgoing' : 'incoming');
    div.innerText = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
    const text = input.value;
    if (text.trim() === "") return;

    appendMessage('me', text);
    socket.emit('chat_message', text);
    input.value = "";
}

btnSend.addEventListener('click', sendMessage);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Listen for incoming messages
socket.on('chat_message', (msg) => {
    appendMessage('them', msg);
});