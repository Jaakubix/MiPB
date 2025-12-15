const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const SECRET_KEY = 'secret_academic_key'; // In prod use env var

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password, fullName, isAcademic } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            password: hashedPassword,
            fullName,
            isAcademic
        });
        res.status(201).json({ message: 'User created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role, name: user.fullName }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, fullName: user.fullName, isAcademic: user.isAcademic } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get Users
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({ attributes: ['id', 'username', 'fullName', 'role', 'isAcademic'] });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error });
    }
});

// Admin: Update Role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.role = role;
        await user.save();
        res.json({ message: 'Role updated', user });
    } catch (error) {
        res.status(500).json({ error });
    }
});

module.exports = router;
