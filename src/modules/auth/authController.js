const authService = require("./authService");

const {
    registerSchema,
    loginSchema,
    googleSchema
} = require("./authValidation");



const register = async (req, res, next) => {

    try {

        const { error } =
            registerSchema.validate(req.body);

        if (error) {

            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const result =
            await authService.registerUser(req.body);

        res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {

        next(error);
    }
};



const login = async (req, res, next) => {

    try {

        const { error } =
            loginSchema.validate(req.body);

        if (error) {

            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const result =
            await authService.loginUser(req.body);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        next(error);
    }
};



const googleLogin = async (req, res, next) => {

    try {

        const { error } =
            googleSchema.validate(req.body);

        if (error) {

            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const result =
            await authService.googleLoginUser(req.body);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        next(error);
    }
};

const getMe = async (req, res, next) => {

    try {

        const user =
            await authService.getCurrentUser(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {

        next(error);
    }
};

const sendOTP = async (req, res, next) => {

    try {

        const result =
            await authService.sendVerificationOTP(
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        next(error);
    }
};

const verifyOTP = async (req, res, next) => {

    try {

        const { otp_code } = req.body;

        const result =
            await authService.verifyOTP(
                req.user.id,
                otp_code
            );

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        next(error);
    }
};

const forgotPassword = async (
    req,
    res,
    next
) => {

    try {

        const { email } = req.body;

        const result =
            await authService
                .forgotPassword(email);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        next(error);
    }
};

const resetPassword = async (
    req,
    res,
    next
) => {

    try {

        const { token } = req.params;

        const { password } = req.body;

        const result =
            await authService
                .resetPassword(
                    token,
                    password
                );

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        next(error);
    }
};

const getAuthConfig = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                googleClientId: process.env.GOOGLE_CLIENT_ID || ""
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    googleLogin,
    getMe,
    sendOTP,
    verifyOTP,
    forgotPassword,
    resetPassword,
    getAuthConfig
};