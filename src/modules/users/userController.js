const userRepository = require("./userRepository");
const { hashPassword, comparePassword } = require("../auth/authUtils");

const userDashboard = async (
    req,
    res
) => {

    res.status(200).json({
        success: true,
        message: "User Dashboard Accessed"
    });
};



const ownerDashboard = async (
    req,
    res
) => {

    res.status(200).json({
        success: true,
        message: "Owner Dashboard Accessed"
    });
};



const adminDashboard = async (
    req,
    res
) => {

    res.status(200).json({
        success: true,
        message: "Admin Dashboard Accessed"
    });
};

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profile = await userRepository.getUserProfile(userId);
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { full_name, email, phone } = req.body;

        if (!full_name || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: "Full name, email, and phone number are required"
            });
        }

        await userRepository.updateUserProfile(userId, { full_name, email, phone });

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: { full_name, email, phone }
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        const userHash = await userRepository.getUserPassword(userId);
        if (!userHash) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await comparePassword(currentPassword, userHash);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect current password"
            });
        }

        const hashedPassword = await hashPassword(newPassword);
        await userRepository.updateUserPassword(userId, hashedPassword);

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    userDashboard,
    ownerDashboard,
    adminDashboard,
    getProfile,
    updateProfile,
    changePassword
};