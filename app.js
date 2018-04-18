const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');

const router = require('./route');

const app = express();

app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.set('port', process.env.PORT || 5000);
app.set('views', `${__dirname}/views`);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

router(app);

app.post('/signin', (req, resp, next) => {
  const user = req.body.user;
  try {
    if (users[user]) {
      resp.redirect('/signin');
    } else {
      resp.cookie('user', user, { maxAge: 1000 * 60 * 60 * 24 * 30 });
      resp.redirect('/');
    }
  } catch (err) {
    next(err, req, resp);
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // res.send('404');
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

const users = {}; //存储在线用户列表的对象

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', socket => {
  socket.on('online', data => {
    socket.name = data.user;
    if (!users[data.user]) {
      users[data.user] = data.user;
    }
    io.sockets.emit('online', { users: users, user: data.user });
  });

  socket.on('say', data => {
    if (data.to === 'all') { // 群发
      io.sockets.emit('say', data);
    } else {
      socket.emit('say', data); // 发给自己
      const clients = io.sockets.clients; // 私聊
      for (let i = 0, len = clients.length; i < len; i++) {
        if (clients[i].name === data.to) {
          clients[i].emit('say', data);
          break;
        }
      }
    }
  });

  socket.on('disconnect', data => {
    if (users[socket.name]) {
      Reflect.deleteProperty(users, socket.name);
      socket.broadcast.emit('offline', data);
    }
  });
});

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});