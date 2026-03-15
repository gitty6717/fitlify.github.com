const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Database configuration
const DB_PATH = path.join(__dirname, 'database', 'database.accdb');
const DB_CONNECTION_STRING = `Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${DB_PATH};Persist Security Info=False;`;

// Initialize database if it doesn't exist
function initializeDatabase() {
    if (!fs.existsSync(DB_PATH)) {
        console.log('Creating MS Access database...');
        // Note: In a real deployment, you'd use proper Access DB creation tools
        // For now, we'll create a simple JSON fallback
        const fallbackDB = {
            users: [
                {
                    id: 1,
                    name: 'Demo User',
                    email: 'demo@fitlify.com',
                    password: 'demo123',
                    phone: '',
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Test User',
                    email: 'test@test.com',
                    password: 'password',
                    phone: '',
                    created_at: new Date().toISOString()
                }
            ]
        };
        
        fs.writeFileSync(path.join(__dirname, 'database', 'users.json'), JSON.stringify(fallbackDB, null, 2));
        console.log('Fallback JSON database created');
    }
}

// Helper function to query database (using JSON fallback for now)
function queryDatabase(query, params = []) {
    return new Promise((resolve, reject) => {
        try {
            const dbPath = path.join(__dirname, 'database', 'users.json');
            if (fs.existsSync(dbPath)) {
                const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                resolve(data);
            } else {
                resolve({ users: [] });
            }
        } catch (error) {
            reject(error);
        }
    });
}

// Helper function to save to database
function saveToDatabase(data) {
    return new Promise((resolve, reject) => {
        try {
            const dbPath = path.join(__dirname, 'database', 'users.json');
            fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

// Routes
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const db = await queryDatabase();
        const user = db.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Update last login
            user.last_login = new Date().toISOString();
            await saveToDatabase(db);
            
            res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    created_at: user.created_at,
                    last_login: user.last_login
                }
            });
        } else {
            res.json({
                success: false,
                message: 'Invalid email or password'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Database error occurred'
        });
    }
});

app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        
        const db = await queryDatabase();
        
        // Check if user already exists
        const existingUser = db.users.find(u => u.email === email);
        if (existingUser) {
            return res.json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        // Create new user
        const newUser = {
            id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
            name,
            email,
            password,
            phone: phone || '',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
        };
        
        db.users.push(newUser);
        await saveToDatabase(db);
        
        res.json({
            success: true,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                created_at: newUser.created_at,
                last_login: newUser.last_login
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Database error occurred'
        });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const db = await queryDatabase();
        res.json({
            success: true,
            users: db.users.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone,
                created_at: u.created_at,
                last_login: u.last_login
            }))
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Database error occurred'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Server is running',
        database: fs.existsSync(DB_PATH) ? 'MS Access DB found' : 'Using JSON fallback',
        timestamp: new Date().toISOString()
    });
});

// Initialize and start server
initializeDatabase();

app.listen(PORT, () => {
    console.log(`Fitlify API Server running on http://localhost:${PORT}`);
    console.log('Database:', fs.existsSync(DB_PATH) ? 'MS Access' : 'JSON fallback');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    process.exit(0);
});
