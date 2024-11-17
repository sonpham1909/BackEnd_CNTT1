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

const updateUser = async (req, res) => {
    try {
        const { userId } = req.user; // Lấy userId từ JWT payload
        const updateData = req.body; // Lấy dữ liệu cần cập nhật từ req.body

        // Loại bỏ password nếu người dùng cố gắng cập nhật password (phải có một hàm riêng cho cập nhật password)
        if (updateData.password) {
            return res.status(400).json({ message: 'Cannot update password here' });
        }

        // Tìm user và cập nhật với dữ liệu từ req.body
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true } // Trả về bản ghi đã cập nhật
        ).select('-password'); // Không trả về password

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

const checkIn = async (req, res) => {
    try {
        const { userId } = req.user; // Lấy userId từ JWT payload
        
        // Tìm user từ cơ sở dữ liệu
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Kiểm tra nếu người dùng đã check-in hôm nay
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt thời gian của hôm nay là 0 giờ để dễ so sánh
        const lastCheckIn = user.lastCheckInDate;

        if (lastCheckIn && lastCheckIn >= today) {
            return res.status(400).json({ message: 'You have already checked in today' });
        }

        // Cập nhật ngày check-in cuối cùng và thưởng điểm
        user.lastCheckInDate = new Date();
        user.point += 10; // Ví dụ: thưởng 10 điểm cho mỗi lần check-in thành công

        // Lưu thông tin user đã cập nhật
        await user.save();

        res.status(200).json({ message: 'Check-in successful', points: user.point });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};


module.exports = {
    register,
    login,
    getUserInfo,
    authenticate,
    updatePublicKey,
    updateUser,
    checkIn
};
