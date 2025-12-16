import { createServer } from 'http';
import { Server } from 'socket.io';

const server = createServer();
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

let game = {
  players: {},        // { socketId: { name, health } }
  round: 1,
  choices: {},        // { socketId: number }
  roundActive: false
};

io.on('connection', (socket) => {
  console.log('🟢 Player connected:', socket.id);

  socket.on('join', (name) => {
    const trimmed = (name || '').trim() || 'Player';
    if (!game.players[socket.id]) {
      game.players[socket.id] = { name: trimmed, health: 10 };
    }
    console.log('Player joined:', trimmed);
    io.emit('players', game.players);
  });

  socket.on('startRound', () => {
    if (Object.keys(game.players).length >= 2 && !game.roundActive) {
      game.roundActive = true;
      game.choices = {};
      console.log(`Round ${game.round} started`);
      io.emit('roundStart', game.round);
    }
  });

  socket.on('choice', (num) => {
    if (!game.roundActive) return;
    const clamped = Math.max(0, Math.min(100, Number(num) || 0));
    game.choices[socket.id] = clamped;
    console.log(`Choice received: ${clamped} from ${game.players[socket.id]?.name}`);

    // When everyone has chosen, end the round
    if (Object.keys(game.choices).length === Object.keys(game.players).length) {
      setTimeout(endRound, 500);
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    delete game.players[socket.id];
    io.emit('players', game.players);
  });
});

function endRound() {
  if (!game.roundActive) return;
  game.roundActive = false;

  const nums = Object.values(game.choices);
  if (nums.length === 0) return;

  // Average × 0.8
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  const target = avg * 0.8;

  // Find closest player(s)
  let closest = Infinity;
  let winners = [];
  Object.entries(game.choices).forEach(([id, choice]) => {
    const dist = Math.abs(choice - target);
    if (dist < closest) {
      closest = dist;
      winners = [id];
    } else if (dist === closest) {
      winners.push(id);
    }
  });

  // Health: winners lose 0, everyone else -1 (start at 10)
  Object.keys(game.players).forEach((id) => {
    const player = game.players[id];
    if (player.health === undefined) {
      player.health = 10;
    }
    if (!winners.includes(id)) {
      player.health -= 1;
    }
  });

  const result = {
    round: game.round,
    avg: avg.toFixed(1),
    target: target.toFixed(1),
    winners,          // array of socketIds
    choices: game.choices
  };

  console.log('Round ended:', result);

  // Send updated state BEFORE incrementing round
  io.emit('result', result);
  io.emit('players', game.players);

  game.round += 1;
}

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log('🟢 Server ready - Waiting for players...');
});
