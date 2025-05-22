const rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function findRoomByPlayerId(playerId) {
  return Object.entries(rooms).find(([code, room]) =>
    room.players.some(p => p.id === playerId)
  );
}

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Novo cliente conectado:", socket.id);

    // ✅ Envia a contagem atual de jogadores online para todos
    io.emit("jogadores_online", io.engine.clientsCount);

    // ✅ Permite que o frontend solicite manualmente a contagem
    socket.on("get_online_count", () => {
      socket.emit("jogadores_online", io.engine.clientsCount);
    });

    // Envia o código para o outro jogador
    socket.on("send_code", ({ code, roomCode }) => {
      socket.to(roomCode).emit("receive_code", { playerId: socket.id, code });
    });

    // Criação de sala
    socket.on("create_game", ({ hostId, hostName }) => {
      const code = generateRoomCode();
      rooms[code] = {
        host: hostId,
        players: [{ id: hostId, name: hostName }],
      };

      socket.join(code);
      console.log("Sala criada:", code);
      socket.emit("room_created", { code });
    });

    // Entrada na sala
    socket.on("join_game", ({ code, player }) => {
      const room = rooms[code];
      if (!room) {
        socket.emit("room_not_found");
        return;
      }

      const exists = room.players.find(p => p.id === player.id);
      if (!exists) {
        if (room.players.length >= 2) {
          socket.emit("room_full");
          return;
        }

        room.players.push(player);
        socket.join(code);
      }

      io.to(code).emit("update_players", {
        players: room.players,
        host: room.host,
      });

      socket.emit("room_joined", { code });
    });

    // Remoção de jogador (kick)
    socket.on("kick_player", ({ roomCode, playerId }) => {
      const room = rooms[roomCode];
      if (!room || room.host !== socket.id) return;

      const index = room.players.findIndex(p => p.id === playerId);
      if (index !== -1) {
        room.players.splice(index, 1);
        io.to(playerId).emit("kicked");
        io.to(playerId).emit("notify", { type: "error", message: "Você foi removido da sala." });

        io.to(roomCode).emit("update_players", {
          players: room.players,
          host: room.host,
        });
      }
    });

    // Execução do código
    socket.on("run_code", ({ code1, code2 }) => {
      const roomCode = Object.keys(rooms).find(code =>
        rooms[code].players.some(p => p.id === socket.id)
      );
      if (roomCode) {
        io.to(roomCode).emit("run_code", { code1, code2 });
      }
    });

    // Notificações
    socket.on("notify", ({ type, message }) => {
      const roomCode = Object.keys(rooms).find(code =>
        rooms[code].players.some(p => p.id === socket.id)
      );
      if (roomCode) {
        io.to(roomCode).emit("notify", { type, message });
      }
    });

    // Saída voluntária (navegou para outra rota)
    socket.on("leave_room", ({ roomCode, playerId }) => {
      if (!roomCode || !rooms[roomCode]) {
        console.log(`⚠️ Evento leave_room ignorado: roomCode inválido (${roomCode})`);
        return;
      }

      const room = rooms[roomCode];
      const isHost = room.host === playerId;

      if (isHost) {
        const player2 = room.players.find(p => p.id !== playerId);
        if (player2) {
          io.to(player2.id).emit("sala_encerrada");
        }
        delete rooms[roomCode];
        console.log("🛑 Host saiu voluntariamente. Sala removida:", roomCode);
      } else {
        const index = room.players.findIndex(p => p.id === playerId);
        if (index !== -1) {
          room.players.splice(index, 1);
          io.to(roomCode).emit("update_players", {
            players: room.players,
            host: room.host,
          });
          console.log("👤 Jogador 2 saiu voluntariamente da sala:", roomCode);
        }
      }
    });

    // Desconexão inesperada (fechou navegador)
    socket.on("disconnect", () => {
      const entry = findRoomByPlayerId(socket.id);
      if (!entry) return;

      const [code, room] = entry;
      const isHost = room.host === socket.id;

      if (isHost) {
        const player2 = room.players.find(p => p.id !== socket.id);
        if (player2) {
          io.to(player2.id).emit("sala_encerrada");
        }
        delete rooms[code];
        console.log("🔌 Host desconectou. Sala removida:", code);
      } else {
        const index = room.players.findIndex(p => p.id === socket.id);
        if (index !== -1) {
          room.players.splice(index, 1);
          io.to(code).emit("update_players", {
            players: room.players,
            host: room.host,
          });
          console.log("🔌 Jogador 2 desconectou da sala:", code);
        }
      }

      // ✅ Atualiza a contagem após desconexão
      const totalJogadoresEmSalas = Object.values(rooms)
  .reduce((sum, room) => sum + room.players.length, 0);

io.emit("jogadores_online", totalJogadoresEmSalas);ss
    });
  });
};
