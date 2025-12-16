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
            { username: 'alice.academic@university.pl', fullName: 'Alice Academic', role: 'Employee', isAcademic: true, position: 'Lecturer' },
            { username: 'nancy.nonacademic@university.pl', fullName: 'Nancy NonAcademic', role: 'Employee', isAcademic: false, position: 'Clerk' },
            { username: 'holly.head@university.pl', fullName: 'Holly Head', role: 'HeadOU', position: 'Head of Department' },
            { username: 'penny.personnel@university.pl', fullName: 'Penny Personnel', role: 'PD', position: 'HR Specialist' },
            { username: 'quentin.quartermaster@university.pl', fullName: 'Quentin Quartermaster', role: 'KWE', position: 'Bursar' },
            { username: 'adam.rector@university.pl', fullName: 'Adam Rector', role: 'Rector', position: 'Rector' },
            { username: 'carl.chancellor@university.pl', fullName: 'Carl Chancellor', role: 'Chancellor', position: 'Chancellor' },
            { username: 'paula.vredu@university.pl', fullName: 'Paula VREdu', role: 'PRK', position: 'Vice-Rector Education' },
            { username: 'peter.vrsci@university.pl', fullName: 'Peter VRSci', role: 'PRN', position: 'Vice-Rector Science' },
            { username: 'mike.mpd@university.pl', fullName: 'Mike MPD', role: 'MPD', position: 'Marketing Specialist' },
            { username: 'admin', fullName: 'System Admin', role: 'Admin', position: 'Administrator' }
        ];

        for (const u of users) {
            // Default password strategy: FirstLast123@
            // For simplicity in seeding, we keep password123 for initial seed or we can update it.
            // User requested: "ImieNazwisko123@"
            const nameParts = u.fullName.split(' ');
            const defaultPass = `${nameParts[0]}${nameParts[1]}123@`;
            const hashedPassword = await bcrypt.hash(defaultPass, 10);
            await User.create({ ...u, password: hashedPassword });
        }
        console.log('Users seeded.');
    }
};

// Sync DB and Start Server
// force: true will drop the table if it already exists
sequelize.sync({ force: true }).then(async () => {
    console.log('Database synced (force: true)');
    await seedData();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
});
