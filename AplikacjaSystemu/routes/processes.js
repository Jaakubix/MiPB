const express = require('express');
const Request = require('../models/Request');
const User = require('../models/User');

const router = express.Router();

// Get all requests (for debugging/admin or list view)
router.get('/', async (req, res) => {
    try {
        const requests = await Request.findAll();
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new request
router.post('/', async (req, res) => {
    try {
        const { id, processType, initiator, currentNode, status, data, history } = req.body;
        // Basic validation
        if (!id || !processType) return res.status(400).json({ message: 'Missing fields' });

        const newRequest = await Request.create({
            id, processType, initiator, currentNode, status, data, history
        });
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update request (process step)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body; // Expects full object or partial updates

        const request = await Request.findByPk(id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        await request.update(updates);
        res.json(request);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
