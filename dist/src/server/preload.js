const { contextBridge, ipcRenderer } = require('electron');

// Expose database functions to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Database operations
    login: async (email, password) => {
        const db = require('./database.js');
        const dbManager = new db();
        return await dbManager.loginUser(email, password);
    },
    
    signup: async (name, email, password, phone) => {
        const db = require('./database.js');
        const dbManager = new db();
        return await dbManager.signupUser(name, email, password, phone);
    },
    
    getUsers: async () => {
        const db = require('./database.js');
        const dbManager = new db();
        return dbManager.getUsers();
    },
    
    // Update functions
    checkForUpdates: () => {
        ipcRenderer.send('check-for-updates');
    },
    
    onUpdateProgress: (callback) => {
        ipcRenderer.on('update-progress', (event, data) => callback(data));
    }
});

// Also expose a simple fetch fallback for when running in browser (development)
contextBridge.exposeInMainWorld('fetchAPI', {
    post: async (url, data) => {
        try {
            // Try to use the exposed database functions first
            if (url.includes('/api/login')) {
                return await window.electronAPI.login(data.email, data.password);
            } else if (url.includes('/api/signup')) {
                return await window.electronAPI.signup(data.name, data.email, data.password, data.phone);
            }
        } catch (error) {
            console.error('Electron API error, falling back to fetch:', error);
        }
        
        // Fallback to regular fetch for development
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            // Final fallback to demo accounts
            const demoAccounts = [
                { email: 'demo@fitlify.com', password: 'demo123', name: 'Demo User', id: 1 },
                { email: 'test@test.com', password: 'password', name: 'Test User', id: 2 }
            ];
            
            if (url.includes('/api/login')) {
                const demoUser = demoAccounts.find(acc => 
                    acc.email === data.email && acc.password === data.password
                );
                
                if (demoUser) {
                    return {
                        success: true,
                        user: {
                            id: demoUser.id,
                            name: demoUser.name,
                            email: demoUser.email,
                            phone: '',
                            created_at: new Date().toISOString(),
                            last_login: new Date().toISOString()
                        }
                    };
                }
            }
            
            return {
                success: false,
                message: 'Authentication failed. Please use demo accounts: demo@fitlify.com / demo123'
            };
        }
    }
});
