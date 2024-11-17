const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/User');


// Secret key for JWT


// Register user
const register = async (req, res) => {
    try {
        const { username, password, publicKey } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            password: hashedPassword,
            publicKey: publicKey || null
        });

        // Save user to database
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Get user info
const getUserInfo = async (req, res) => {
    try {
        const { userId } = req.user;

        // Find user by ID
        const user = await User.findById(userId).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Middleware to authenticate user by JWT token
const authenticate = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token, access denied' });
    }
};

const updatePublicKey = async (req, res) => {
    try {
        const { publicKey } = req.body;
        const { userId } = req.user; // Lấy userId từ JWT payload

        if (!publicKey) {
            return res.status(400).json({ message: 'Public key is required' });
        }

        // Tìm user và cập nhật publicKey
        const user = await User.findByIdAndUpdate(
            userId,
            { publicKey },
            { new: true } // Trả về bản ghi đã cập nhật
        ).select('-password'); // Không trả về password

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Public key updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

module.exports = {
    register,
    login,
    getUserInfo,
    authenticate,
    updatePublicKey
};
