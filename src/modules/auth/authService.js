const authRepository = require("./authRepository");
const transporter = require("../../config/mail");
const financeRepository =require("../finance/financeRepository");
const logger =require("../../utils/logger/logger");


const {
    generateResetToken,
    resetTokenExpiry
} = require("./resetUtils");


const {
    hashPassword,
    comparePassword,
    generateToken
} = require("./authUtils");

const {
    generateOTP,
    otpExpiryTime
} = require("./otpUtils");


const registerUser = async (userData) => {

    const existingUser =
        await authRepository.findUserByEmail(userData.email);

    if (existingUser) {

        throw new Error("Email already registered");
    }

    const hashedPassword =
        await hashPassword(userData.password);

    userData.password = hashedPassword;

    const createdUser =
        await authRepository.createUser(userData);

    const userId =
        createdUser.insertId;

    // CREATE USER WALLET
    await financeRepository
        .createWallet(

            userId,

            userData.role === "OWNER"
                ? "OWNER"
                : "USER"
        );

    return {
        message: "User registered successfully"
    };
};



const loginUser = async ({ email, password }) => {

    const user =
        await authRepository.findUserByEmail(email);

    if (!user) {
        logger.warn(

            `Failed login attempt for email: ${email}`
        );

        throw new Error("Invalid credentials");
    }

    const isPasswordValid =
        await comparePassword(password, user.password);

    if (!isPasswordValid) {

        logger.warn(

            `Failed login attempt for email: ${email}`
        );

        throw new Error("Invalid credentials");
    }

    const token = generateToken({
        id: user.id,
        role: user.role
    });

    return {
        token,
        user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            is_verified: user.is_verified
        }
    };
};

const getCurrentUser = async (userId) => {

    const user =
        await authRepository.findUserById(userId);

    if (!user) {

        throw new Error("User not found");
    }

    return user;
};

const sendVerificationOTP = async (userId) => {

    const user =
        await authRepository.findUserById(userId);

    if (!user) {

        throw new Error("User not found");
    }

    const otpCode = generateOTP();

    const expiresAt = otpExpiryTime();

    await authRepository.createOTPRecord(
        userId,
        otpCode,
        expiresAt
    );

    await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to: user.email,

        subject: "OTP Verification",

        html: `
            <h2>Email Verification</h2>
            <p>Your OTP is:</p>
            <h1>${otpCode}</h1>
            <p>Valid for 10 minutes.</p>
        `
    });

    return {
        message: "OTP sent successfully"
    };
};

const verifyOTP = async (
    userId,
    otpCode
) => {

    const otpRecord =
        await authRepository.findValidOTP(
            userId,
            otpCode
        );

    if (!otpRecord) {

        throw new Error("Invalid or expired OTP");
    }

    await authRepository.markOTPUsed(
        otpRecord.id
    );

    await authRepository.verifyUser(userId);

    return {
        message: "Account verified successfully"
    };
};

const forgotPassword = async (
    email
) => {

    const user =
        await authRepository.findUserByEmail(email);

    if (!user) {

        throw new Error("User not found");
    }

    const resetToken =
        generateResetToken();

    const expiresAt =
        resetTokenExpiry();

    await authRepository
        .createPasswordResetToken(
            user.id,
            resetToken,
            expiresAt
        );

    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5500/frontend';
    const resetLink =
`${frontendBaseUrl}/auth/auth.html?token=${resetToken}`;



    await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to: user.email,

        subject: "Reset Password",

        html: `
            <h2>Password Reset</h2>

            <p>Click below link:</p>

            <a href="${resetLink}">
                Reset Password
            </a>

            <p>Valid for 15 minutes.</p>
        `
    });

    return {
        message:
            "Password reset email sent"
    };
};

const resetPassword = async (
    token,
    newPassword
) => {

    const tokenRecord =
        await authRepository
            .findValidResetToken(token);

    if (!tokenRecord) {

        throw new Error(
            "Invalid or expired token"
        );
    }

    const hashedPassword =
        await hashPassword(newPassword);

    await authRepository
        .updateUserPassword(
            tokenRecord.user_id,
            hashedPassword
        );

    await authRepository
        .markResetTokenUsed(
            tokenRecord.id
        );

    return {
        message:
            "Password reset successful"
    };
};

const googleLoginUser = async ({ email, full_name }) => {

    let user =
        await authRepository.findUserByEmail(email);

    if (!user) {

        const hashedPassword =
            await hashPassword("GoogleOAuthPassword2026!");

        const userData = {
            full_name,
            email,
            phone: null,
            password: hashedPassword
        };

        const createdUser =
            await authRepository.createUser(userData);

        const userId =
            createdUser.insertId;

        // Auto verify user
        await authRepository.verifyUser(userId);

        // CREATE USER WALLET
        await financeRepository
            .createWallet(userId, "USER");

        user = await authRepository.findUserById(userId);

    } else {

        if (!user.is_verified) {

            await authRepository.verifyUser(user.id);

            user.is_verified = true;
        }
    }

    const token = generateToken({
        id: user.id,
        role: user.role
    });

    return {
        token,
        user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            is_verified: user.is_verified
        }
    };
};

module.exports = {
    registerUser,
    loginUser,
    googleLoginUser,
    getCurrentUser,
    sendVerificationOTP,
    verifyOTP,
    forgotPassword,
    resetPassword
};
