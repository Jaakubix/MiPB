const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sequelize = require('./database');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const Request = require('./models/Request');

const authRoutes = require('./routes/auth');
const processRoutes = require('./routes/processes');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', authRoutes);
app.use('/api/requests', processRoutes);

// Seed Data
const seedData = async () => {
    const userCount = await User.count();
    if (userCount === 0) {
        console.log('Seeding users...');
        const password = await bcrypt.hash('password123', 10);
        const users = [
            { username: 'alice', fullName: 'Alice Academic', role: 'Employee', isAcademic: true },
            { username: 'nancy', fullName: 'Nancy NonAcademic', role: 'Employee', isAcademic: false },
            { username: 'holly', fullName: 'Holly Head', role: 'HeadOU' },
            { username: 'penny', fullName: 'Penny Personnel', role: 'PD' },
            { username: 'quentin', fullName: 'Quentin Quartermaster', role: 'KWE' },
            { username: 'adam', fullName: 'Adam Rector', role: 'Rector' },
            { username: 'carl', fullName: 'Carl Chancellor', role: 'Chancellor' },
            { username: 'paula', fullName: 'Paula VREdu', role: 'PRK' },
            { username: 'peter', fullName: 'Peter VRSci', role: 'PRN' },
            { username: 'mike', fullName: 'Mike MPD', role: 'MPD' },
            { username: 'admin', fullName: 'System Admin', role: 'Admin' } // New Admin
        ];

        for (const u of users) {
            await User.create({ ...u, password });
        }
        console.log('Users seeded.');
    }
};

// Sync DB and Start Server
sequelize.sync().then(async () => {
    console.log('Database synced');
    await seedData();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
});
