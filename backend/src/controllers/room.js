import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      include: { users: true }
    });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.body;
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    });
    if (!room || !room.isActive) {
      return res.status(404).json({ error: 'Room not found or inactive' });
    }
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { roomId }
    });
    res.json({ message: 'Joined room successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { roomId: null }
    });
    res.json({ message: 'Left room successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};