const socket = io('http://127.0.0.1:5000');
const submitBtn = document.querySelector('#submit-btn');
const inputBox = document.querySelector('#input-box');
const chatBox = document.querySelector('.chat-box');

socket.on('connect', () => {
  submitBtn.addEventListener('click', () => {
    socket.emit('news', inputBox.value);
    inputBox.value = '';
  }, false);
  socket.on('news', (data) => {
    const message = document.createElement('p');
    message.className = 'chat-message-item';
    message.innerHTML = data;
    chatBox.appendChild(message);
  });
});


