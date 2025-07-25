//const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { username, email } = req.body;

        const updated = await User.findByIdAndUpdate(
            userId,
            { username, email },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);

        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) return res.status(400).json({ message: 'Old password incorrect' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error changing password' });
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { avatar: `/uploads/avatars/${req.file.filename}` },
            { new: true }
        ).select('-password');

        res.json({ message: 'Avatar updated', user });
    } catch (err) {
        res.status(500).json({ message: 'Failed to upload avatar' });
    }
};

// ✅ Get Logged In User Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('username email role');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to load profile' });
    }
};

// ✅ Update Logged In User Profile
exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { username, email },
            { new: true, runValidators: true }
        );
        res.json({ message: 'Profile updated', user });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

// ✅ Change Password
exports.changePassword = async (req, res) => {
    try {
        const { current, new: newPassword } = req.body;
        const user = await User.findById(req.user.userId);

        const isMatch = await user.comparePassword(current);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Password update failed' });
    }
};

