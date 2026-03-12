const socket = io();
const btnLocate = document.getElementById('btn-locate');
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');
const searchText = document.getElementById('search-text');
const partnerLoc = document.getElementById('partner-location');
const partnerDist = document.getElementById('partner-distance');
const userListDiv = document.getElementById('user-list');
const nameInputContainer = document.getElementById('name-input-container');
const usernameInput = document.getElementById('username-input');
const btnSetName = document.getElementById('btn-set-name');

const ROOM_NAME = 'antipode-friends';
let myUsername = '';

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
        partnerLoc.innerText = `Location: Connected to Friends Room`;
        partnerDist.innerText = `Status: Ready to Chat!`;

        step2.classList.add('hidden');
        step3.classList.remove('hidden');

        socket.emit('join_room', ROOM_NAME);

    }, 1500);
}

function error() {
    searchText.innerText = `Connecting to friends...`;
    setTimeout(() => {
        partnerLoc.innerText = `Location: Connected to Friends Room`;
        partnerDist.innerText = `Status: Ready to Chat!`;
        step2.classList.add('hidden');
        step3.classList.remove('hidden');
        socket.emit('join_room', ROOM_NAME);
    }, 1500);
}

btnSetName.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (name.length > 0) {
        myUsername = name;
        nameInputContainer.classList.add('hidden');
        socket.emit('set_username', myUsername);
    } else {
        alert('Please enter a name!');
    }
});

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

socket.on('chat_message', (msg) => {
    appendMessage('them', msg);
});

socket.on('user_list', (users) => {
    if (userListDiv) {
        userListDiv.innerHTML = '';
        users.forEach(user => {
            const div = document.createElement('div');
            div.classList.add('user-item');
            div.innerHTML = `👤 ${user}`;
            userListDiv.appendChild(div);
        });
    }
});

socket.on('user_joined', (user) => {
    appendMessage('system', `${user} joined the chat!`);
});

socket.on('user_left', (user) => {
    appendMessage('system', `${user} left the chat!`);
});

socket.on('username_set', (username) => {
    myUsername = username;
    nameInputContainer.classList.add('hidden');
});
