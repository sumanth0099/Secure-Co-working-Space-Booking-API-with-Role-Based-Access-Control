const express = require('express');
const { Op } = require('sequelize');
const { Workspace, Booking } = require('../models');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/available', async (req, res) => {
  try {
    const { start_time, end_time } = req.query;
    if (!start_time || !end_time) {
      return res.status(400).json({ error: 'start_time and end_time are required' });
    }

    const start = new Date(start_time);
    const end = new Date(end_time);

    if (isNaN(start) || isNaN(end) || start >= end) {
      return res.status(400).json({ error: 'Invalid time window' });
    }

    const overlappingBookings = await Booking.findAll({
      where: {
        start_time: { [Op.lt]: end },
        end_time: { [Op.gt]: start },
        status: 'CONFIRMED'
      },
      attributes: ['workspace_id']
    });

    const bookedWorkspaceIds = overlappingBookings.map(b => b.workspace_id);

    const availableWorkspaces = await Workspace.findAll({
      where: {
        id: {
          [Op.notIn]: bookedWorkspaceIds.length > 0 ? bookedWorkspaceIds : [0]
        }
      }
    });

    res.json(availableWorkspaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, type, capacity } = req.body;
    const workspace = await Workspace.create({ name, type, capacity });
    res.status(201).json(workspace);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const workspace = await Workspace.findByPk(req.params.id);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    await workspace.update(req.body);
    res.json(workspace);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const workspace = await Workspace.findByPk(req.params.id);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    await workspace.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const workspaces = await Workspace.findAll();
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const workspace = await Workspace.findByPk(req.params.id);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
