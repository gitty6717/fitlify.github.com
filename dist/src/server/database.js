// Simple Database Manager for Electron App
// Works without external Node.js modules

class DatabaseManager {
    constructor() {
        const path = require('path');
        this.dbPath = path.join(__dirname, '../database/users.json');
        this.initializeDatabase();
    }

    initializeDatabase() {
        const fs = require('fs');
        const path = require('path');
        
        try {
            // Try to read existing database
            if (fs.existsSync(this.dbPath)) {
                const data = fs.readFileSync(this.dbPath, 'utf8');
                this.users = JSON.parse(data).users || [];
            } else {
                // Create with default users
                this.users = [
                    {
                        id: 1,
                        name: 'Demo User',
                        email: 'demo@fitlify.com',
                        password: 'demo123',
                        phone: '',
                        created_at: new Date().toISOString(),
                        last_login: new Date().toISOString()
                    },
                    {
                        id: 2,
                        name: 'Test User',
                        email: 'test@test.com',
                        password: 'password',
                        phone: '',
                        created_at: new Date().toISOString(),
                        last_login: new Date().toISOString()
                    }
                ];
                this.saveDatabase();
            }
        } catch (error) {
            console.error('Database initialization error:', error);
            this.users = [];
        }
    }

    saveDatabase() {
        try {
            const fs = require('fs');
            const data = { users: this.users };
            fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error('Database save error:', error);
            return false;
        }
    }

    async loginUser(email, password) {
        try {
            const user = this.users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Update last login
                user.last_login = new Date().toISOString();
                this.saveDatabase();
                
                return {
                    success: true,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone || '',
                        created_at: user.created_at,
                        last_login: user.last_login
                    }
                };
            }
            
            return {
                success: false,
                message: 'Invalid email or password'
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Database error occurred'
            };
        }
    }

    async signupUser(name, email, password, phone) {
        try {
            // Check if user already exists
            const existingUser = this.users.find(u => u.email === email);
            if (existingUser) {
                return {
                    success: false,
                    message: 'User with this email already exists'
                };
            }
            
            // Create new user
            const newUser = {
                id: this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1,
                name,
                email,
                password,
                phone: phone || '',
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
            };
            
            this.users.push(newUser);
            this.saveDatabase();
            
            return {
                success: true,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone,
                    created_at: newUser.created_at,
                    last_login: newUser.last_login
                }
            };
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                message: 'Database error occurred'
            };
        }
    }

    getUsers() {
        return this.users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            created_at: u.created_at,
            last_login: u.last_login
        }));
    }
}

// Export for use in renderer process
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseManager;
} else if (typeof window !== 'undefined') {
    window.DatabaseManager = DatabaseManager;
}
