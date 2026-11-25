const EventEmitter = require('events');

const appEvents = new EventEmitter();

// Event-driven features: listeners react to things happening in the app
appEvents.on('user:signup', (u) => console.log(`[EVENT] New user registered: ${u.username} (${u.email})`));
appEvents.on('user:login', (u) => console.log(`[EVENT] User logged in: ${u.email}`));
appEvents.on('note:created', (n) => console.log(`[EVENT] Note created: "${n.title}" by ${n.owner}`));
appEvents.on('chat:message', (m) => console.log(`[EVENT] Chat message from ${m.user}: ${m.text}`));
appEvents.on('chat:join', (u) => console.log(`[EVENT] ${u} connected to chat`));
appEvents.on('chat:leave', (u) => console.log(`[EVENT] ${u} disconnected from chat`));

module.exports = appEvents;
