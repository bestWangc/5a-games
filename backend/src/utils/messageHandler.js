export const broadcastRoomUpdate = (io, roomId) => {
    io.to(roomId.toString()).emit('room_update', { roomId });
};

export const broadcastGameStart = (io, roomId) => {
    io.to(roomId.toString()).emit('game_start', { roomId });
};

export const broadcastGameEnd = (io, roomId) => {
    io.to(roomId.toString()).emit('game_end', { roomId });
};
