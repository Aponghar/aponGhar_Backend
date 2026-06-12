const crypto = require("crypto");



const generateResetToken = () => {

    return crypto
        .randomBytes(32)
        .toString("hex");
};



const resetTokenExpiry = () => {

    const expiry = new Date();

    expiry.setMinutes(
        expiry.getMinutes() + 15
    );

    return expiry;
};



module.exports = {
    generateResetToken,
    resetTokenExpiry
};