const jwt = require('jsonwebtoken');
const events = require('./events/emitter');
const { parseCookies } = require('./middleware/auth');

module.exports = function (io) {
  // Authenticate every socket connection with the JWT
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      parseCookies(socket.handshake.headers.cookie).token;
    if (!token) return next(new Error('No token provided'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const name = socket.user.username;
    events.emit('chat:join', name);
    socket.broadcast.emit('system', `${name} joined the chat`);

    socket.on('chat message', (text) => {
      if (typeof text !== 'string' || !text.trim()) return;
      const msg = { user: name, text: text.trim(), time: new Date().toISOString() };
      events.emit('chat:message', msg);
      io.emit('chat message', msg); // real-time broadcast to everyone
    });

    socket.on('disconnect', () => {
      events.emit('chat:leave', name);
      socket.broadcast.emit('system', `${name} left the chat`);
    });
  });
};
