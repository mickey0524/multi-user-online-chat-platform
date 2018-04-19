// const socket = io('http://127.0.0.1:5000');
// const submitBtn = document.querySelector('#submit-btn');
// const inputBox = document.querySelector('#input-box');
// const chatBox = document.querySelector('.chat-box');

// socket.on('connect', () => {
//   submitBtn.addEventListener('click', () => {
//     socket.emit('news', inputBox.value);
//     inputBox.value = '';
//   }, false);
//   socket.on('news', (data) => {
//     const message = document.createElement('p');
//     message.className = 'chat-message-item';
//     message.innerHTML = data;
//     chatBox.appendChild(message);
//   });
// });

$(function() {
  const socket = io('http://127.0.0.1:5000');
  const user = $.cookie('user');
  const $userList = $('.user-list');
  let userArr = []; // 解决reconnect的单一用户多显示bug
  let to = 'all';
  
  socket.on('connect', () => {
    socket.emit('online', { user });

    /**
     * 接收到有人上线的消息
     */
    socket.on('online', data => {
      if ($('.user-item').length > 0) { // 说明是有他人进入聊天室
        if (userArr.includes(data.user)) {
          return;
        }
        const $userItem = $(`<p class="user-item">${data.user}</p>`);
        $userList.append($userItem);
        userArr.push(data.user);
      } else {
        let $fragment = $(document.createDocumentFragment());
        userArr = Object.keys(data.users);
        userArr.forEach(user => {
          const $userItem = $(`<p class="user-item">${user}</p>`);
          $fragment.append($userItem);
        });
        $userList.append($fragment);
      }
    });

    /**
     * 接收到有人下线的消息
     */
    socket.on('offline', data => {
      $userList.children('.user-item').each((index, user) => {
        if (user.innerHTML === data.user) {
          $(user).remove();
          const userIndex = userArr.indexOf(data.user);
          if (userIndex !== -1) {
            userArr.splice(userIndex, 1);
          }
          return false;
        }
      })
    });
    
    /**
     * 服务器挂了
     */
    socket.on('disconnect', () => {
      $userList.empty();
    });
    
    /**
     * 重新连接服务器
     */
    socket.on('reconnect', () => {
      socket.emit('online', { user });
    });

    /**
     * 接收到有人说话
     */
    socket.on('say', () => {
      
    });
  });
});


