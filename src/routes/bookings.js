const express = require('express');
const { Op } = require('sequelize');
const { Booking, Workspace, User, sequelize } = require('../models');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

const calculateCost = (workspace, durationHours) => {
  if (workspace.type === 'DESK') {
    return 10 * durationHours;
  } else if (workspace.type === 'MEETING_ROOM') {
    return 5 * workspace.capacity * durationHours;
  }
  return 0;
};

router.post('/', authenticate, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { workspace_id, start_time, end_time } = req.body;
    
    const start = new Date(start_time);
    const end = new Date(end_time);
    const now = new Date();

    if (isNaN(start) || isNaN(end) || start >= end || start < now) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid start or end time' });
    }

    const workspace = await Workspace.findByPk(workspace_id, { transaction });
    if (!workspace) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const conflict = await Booking.findOne({
      where: {
        workspace_id,
        status: 'CONFIRMED',
        start_time: { [Op.lt]: end },
        end_time: { [Op.gt]: start }
      },
      transaction
    });

    if (conflict) {
      await transaction.rollback();
      return res.status(409).json({ error: 'Time slot is already booked' });
    }

    const durationHours = (end - start) / (1000 * 60 * 60);
    const cost = calculateCost(workspace, durationHours);

    const user = await User.findByPk(req.user.user_id, { transaction });
    if (user.credits < cost) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Insufficient credits' });
    }

    user.credits -= cost;
    await user.save({ transaction });

    const booking = await Booking.create({
      user_id: user.id,
      workspace_id,
      start_time: start,
      end_time: end,
      status: 'CONFIRMED'
    }, { transaction });

    await transaction.commit();
    res.status(201).json(booking);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const booking = await Booking.findByPk(req.params.id, { 
      include: [Workspace],
      transaction 
    });
    
    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.user_id !== req.user.user_id && req.user.role !== 'ADMIN') {
      await transaction.rollback();
      return res.status(403).json({ error: 'Forbidden' });
    }

    const now = new Date();
    const startTime = new Date(booking.start_time);
    const hoursUntilStart = (startTime - now) / (1000 * 60 * 60);

    if (hoursUntilStart > 24) {
      const durationHours = (new Date(booking.end_time) - startTime) / (1000 * 60 * 60);
      const refundAmount = calculateCost(booking.Workspace, durationHours);

      const user = await User.findByPk(booking.user_id, { transaction });
      user.credits += refundAmount;
      await user.save({ transaction });
    }

    await booking.destroy({ transaction });
    await transaction.commit();
    
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
