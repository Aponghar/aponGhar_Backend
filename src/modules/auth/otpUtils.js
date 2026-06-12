const generateOTP = () => {

    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();
};



const otpExpiryTime = () => {

    const expiry = new Date();

    expiry.setMinutes(expiry.getMinutes() + 10);

    return expiry;
};



module.exports = {
    generateOTP,
    otpExpiryTime
};