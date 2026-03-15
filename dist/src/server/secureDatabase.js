// Secure Database Manager with bcrypt and JWT
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SecureDatabaseManager {
    constructor() {
        this.dbPath = path.join(__dirname, '../database/users.json');
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        this.saltRounds = 12;
        this.initializeDatabase();
    }

    // Input validation and sanitization
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const sanitizedEmail = email.toLowerCase().trim();
        return {
            isValid: emailRegex.test(sanitizedEmail),
            sanitized: sanitizedEmail
        };
    }

    validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return {
            isValid: passwordRegex.test(password),
            message: password.length < 8 ? 'Password must be at least 8 characters' :
                     !/(?=.*[a-z])/.test(password) ? 'Password must contain at least 1 lowercase letter' :
                     !/(?=.*[A-Z])/.test(password) ? 'Password must contain at least 1 uppercase letter' :
                     !/(?=.*\d)/.test(password) ? 'Password must contain at least 1 number' :
                     'Password is valid'
        };
    }

    validateName(name) {
        const sanitizedName = name.trim().replace(/[<>]/g, '');
        return {
            isValid: sanitizedName.length >= 2 && sanitizedName.length <= 50,
            sanitized: sanitizedName
        };
    }

    validatePhone(phone) {
        // Remove all non-digit characters
        const sanitizedPhone = phone.replace(/\D/g, '');
        return {
            isValid: sanitizedPhone.length === 10 || sanitizedPhone.length === 0, // Allow empty phone
            sanitized: sanitizedPhone
        };
    }

    initializeDatabase() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const data = fs.readFileSync(this.dbPath, 'utf8');
                this.users = JSON.parse(data).users || [];
            } else {
                // Create with default users (hashed passwords)
                this.users = [
                    {
                        id: 1,
                        name: 'Demo User',
                        email: 'demo@fitlify.com',
                        password: this.hashPassword('demo123'),
                        phone: '',
                        created_at: new Date().toISOString(),
                        last_login: new Date().toISOString()
                    },
                    {
                        id: 2,
                        name: 'Test User',
                        email: 'test@test.com',
                        password: this.hashPassword('password'),
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

    hashPassword(password) {
        try {
            return bcrypt.hashSync(password, this.saltRounds);
        } catch (error) {
            console.error('Password hashing error:', error);
            return null;
        }
    }

    comparePassword(password, hashedPassword) {
        try {
            return bcrypt.compareSync(password, hashedPassword);
        } catch (error) {
            console.error('Password comparison error:', error);
            return false;
        }
    }

    generateJWT(user) {
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            iat: Date.now() / 1000
        };
        
        return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
    }

    verifyJWT(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            console.error('JWT verification error:', error);
            return null;
        }
    }

    saveDatabase() {
        try {
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
            // Validate input
            const emailValidation = this.validateEmail(email);
            if (!emailValidation.isValid) {
                return {
                    success: false,
                    message: 'Invalid email format'
                };
            }

            const user = this.users.find(u => u.email === emailValidation.sanitized);
            
            if (user && this.comparePassword(password, user.password)) {
                // Update last login
                user.last_login = new Date().toISOString();
                this.saveDatabase();
                
                // Generate JWT token
                const token = this.generateJWT(user);
                
                return {
                    success: true,
                    message: 'Login successful',
                    token: token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone || '',
                        created_at: user.created_at,
                        last_login: user.last_login
                    }
                };
            } else {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Login failed due to server error'
            };
        }
    }

    async signupUser(name, email, password, phone = '') {
        try {
            // Validate all inputs
            const nameValidation = this.validateName(name);
            const emailValidation = this.validateEmail(email);
            const passwordValidation = this.validatePassword(password);
            const phoneValidation = this.validatePhone(phone);

            if (!nameValidation.isValid) {
                return {
                    success: false,
                    message: 'Name must be between 2 and 50 characters'
                };
            }

            if (!emailValidation.isValid) {
                return {
                    success: false,
                    message: 'Invalid email format'
                };
            }

            if (!passwordValidation.isValid) {
                return {
                    success: false,
                    message: passwordValidation.message
                };
            }

            if (!phoneValidation.isValid) {
                return {
                    success: false,
                    message: 'Phone number must be 10 digits or empty'
                };
            }

            // Check if user already exists
            const existingUser = this.users.find(u => u.email === emailValidation.sanitized);
            if (existingUser) {
                return {
                    success: false,
                    message: 'Email already registered'
                };
            }

            // Create new user with hashed password
            const newUser = {
                id: Math.max(...this.users.map(u => u.id), 0) + 1,
                name: nameValidation.sanitized,
                email: emailValidation.sanitized,
                password: this.hashPassword(password),
                phone: phoneValidation.sanitized,
                created_at: new Date().toISOString(),
                last_login: null
            };

            this.users.push(newUser);
            
            if (this.saveDatabase()) {
                // Generate JWT token for immediate login
                const token = this.generateJWT(newUser);
                
                return {
                    success: true,
                    message: 'Account created successfully',
                    token: token,
                    user: {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        phone: newUser.phone,
                        created_at: newUser.created_at,
                        last_login: newUser.last_login
                    }
                };
            } else {
                return {
                    success: false,
                    message: 'Failed to save user data'
                };
            }
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                message: 'Signup failed due to server error'
            };
        }
    }

    getUserById(id) {
        try {
            const user = this.users.find(u => u.id === parseInt(id));
            if (user) {
                // Don't return password
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            }
            return null;
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    }

    updateUserProfile(id, updates) {
        try {
            const userIndex = this.users.findIndex(u => u.id === parseInt(id));
            if (userIndex === -1) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            // Validate and sanitize updates
            const allowedUpdates = {};
            
            if (updates.name) {
                const nameValidation = this.validateName(updates.name);
                if (nameValidation.isValid) {
                    allowedUpdates.name = nameValidation.sanitized;
                }
            }

            if (updates.email) {
                const emailValidation = this.validateEmail(updates.email);
                if (emailValidation.isValid) {
                    // Check if email is already taken by another user
                    const existingUser = this.users.find(u => u.email === emailValidation.sanitized && u.id !== parseInt(id));
                    if (existingUser) {
                        return {
                            success: false,
                            message: 'Email already taken by another user'
                        };
                    }
                    allowedUpdates.email = emailValidation.sanitized;
                }
            }

            if (updates.phone !== undefined) {
                const phoneValidation = this.validatePhone(updates.phone);
                if (phoneValidation.isValid) {
                    allowedUpdates.phone = phoneValidation.sanitized;
                }
            }

            // Update user
            this.users[userIndex] = { ...this.users[userIndex], ...allowedUpdates };
            
            if (this.saveDatabase()) {
                return {
                    success: true,
                    message: 'Profile updated successfully',
                    user: this.getUserById(id)
                };
            } else {
                return {
                    success: false,
                    message: 'Failed to update profile'
                };
            }
        } catch (error) {
            console.error('Update profile error:', error);
            return {
                success: false,
                message: 'Profile update failed due to server error'
            };
        }
    }

    changePassword(id, currentPassword, newPassword) {
        try {
            const user = this.users.find(u => u.id === parseInt(id));
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            // Verify current password
            if (!this.comparePassword(currentPassword, user.password)) {
                return {
                    success: false,
                    message: 'Current password is incorrect'
                };
            }

            // Validate new password
            const passwordValidation = this.validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                return {
                    success: false,
                    message: passwordValidation.message
                };
            }

            // Update password
            user.password = this.hashPassword(newPassword);
            
            if (this.saveDatabase()) {
                return {
                    success: true,
                    message: 'Password changed successfully'
                };
            } else {
                return {
                    success: false,
                    message: 'Failed to update password'
                };
            }
        } catch (error) {
            console.error('Change password error:', error);
            return {
                success: false,
                message: 'Password change failed due to server error'
            };
        }
    }
}

module.exports = SecureDatabaseManager;
