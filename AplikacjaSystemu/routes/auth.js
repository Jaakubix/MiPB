const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const SECRET_KEY = 'secret_academic_key'; // In prod use env var

// Register (Add User)
router.post('/register', async (req, res) => {
    try {
        const { username, fullName, position, role, isAcademic } = req.body;

        // Default Password Generation: FirstNameLastName123@
        // Assuming fullName is "First Last"
        const nameParts = fullName.split(' ');
        const first = nameParts[0] || 'User';
        const last = nameParts[1] || '';
        const defaultPassword = `${first}${last}123@`; // e.g. AliceAcademic123@

        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const user = await User.create({
            username, // Email
            password: hashedPassword,
            fullName,
            role: role || 'Employee',
            position,
            isAcademic: isAcademic || false
        });
        res.status(201).json({ message: 'User created', defaultPassword });
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
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                fullName: user.fullName,
                isAcademic: user.isAcademic,
                position: user.position
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Change Password
router.post('/change-password', async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;
        // Ideally verify token matches userId
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const valid = await bcrypt.compare(oldPassword, user.password);
        if (!valid) return res.status(401).json({ message: 'Invalid old password' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { userId } = req.body; // Admin passes ID
        // Middleware should check if requester is Admin (skipped for simplicity as per instructions)

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const nameParts = user.fullName.split(' ');
        const first = nameParts[0] || 'User';
        const last = nameParts[1] || '';
        const defaultPassword = `${first}${last}123@`;

        user.password = await bcrypt.hash(defaultPassword, 10);
        await user.save();
        res.json({ message: `Password reset to ${defaultPassword}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get Users
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({ attributes: ['id', 'username', 'fullName', 'role', 'isAcademic', 'position'] });
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
