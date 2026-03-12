const socket = io();
const btnLocate = document.getElementById('btn-locate');
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');
const searchText = document.getElementById('search-text');
const partnerLoc = document.getElementById('partner-location');
const partnerDist = document.getElementById('partner-distance');

// Simple room name for friends to connect
const ROOM_NAME = 'antipode-friends';

// 1. Get User Location (Optional - just for fun)
btnLocate.addEventListener('click', () => {
    step1.classList.add('hidden');
    step2.classList.remove('hidden');

    navigator.geolocation.getCurrentPosition(success, error);
});

function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    searchText.innerText = `Connecting to friends...`;

    setTimeout(() => {
        // Update UI
        partnerLoc.innerText = `Location: Connected to Friends Room`;
        partnerDist.innerText = `Status: Ready to Chat!`;

        step2.classList.add('hidden');
        step3.classList.remove('hidden');

        // Join the shared room
        socket.emit('join_room', ROOM_NAME);

    }, 1500); // 1.5 second delay
}

function error() {
    // If location fails, still connect
    searchText.innerText = `Connecting to friends...`;
    setTimeout(() => {
        partnerLoc.innerText = `Location: Connected to Friends Room`;
        partnerDist.innerText = `Status: Ready to Chat!`;
        step2.classList.add('hidden');
        step3.classList.remove('hidden');
        socket.emit('join_room', ROOM_NAME);
    }, 1500);
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
