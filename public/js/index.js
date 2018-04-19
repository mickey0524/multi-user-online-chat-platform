$(function() {
  const socket = io('http://127.0.0.1:5000');
  const user = $.cookie('user');
  const $userList = $('.user-list');
  const $messageList = $('.chat-message');
  const $inputBox = $('#input-box');
  let userArr = []; // 解决reconnect的单一用户多显示bug
  let isInputBoxFocus = true;

  $inputBox.focus(() => {
    isInputBoxFocus = true;
  });

  $inputBox.blur(() => {
    isInputBoxFocus = false;
  });

  $userList.dblclick(ev => {
    const target = ev.target;
    $inputBox.val(`给${$(target).text()}说悄悄话: `);
  });

  /**
   * 获取当前时间
   */
  const getNowTime = () => {
    const date = new Date();
    const time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
    return time;
  }
  
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
    socket.on('say', data => {
      if (data.from !== user && data.to !== 'all' && data.to !== user) {
        return;
      }
      const $messageItem = $(`<p class="chat-message-item">${user}: ${data.message} ${getNowTime()}</p>`);
      if (data.from === user) {
        $messageItem.addClass('sender');
      }
      $messageList.append($messageItem);
    });

    $(window).keydown(ev => {
      if (isInputBoxFocus && ev.keyCode == 13) {
        let inputBoxVal = $inputBox.val();
        let to = 'all';
        inputBoxVal = inputBoxVal.replace(/^给(.+)说悄悄话: /g, ($0, $1) => {
          to = $1;
          return '';
        });
        if (!inputBoxVal) {
          return;
        }
        const data = {
          from: user,
          to,
          message: inputBoxVal,
        };
        socket.emit('say', data);
        if (to === 'all') {
          $inputBox.val('');
        } else {
          $inputBox.val(`给${to}说悄悄话: `);
        }
      }
    });
  });
});


