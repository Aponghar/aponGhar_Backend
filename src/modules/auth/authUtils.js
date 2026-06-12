const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



// HASH PASSWORD
const hashPassword = async (password) => {

    const salt = await bcrypt.genSalt(10);

    return bcrypt.hash(password, salt);
};



// COMPARE PASSWORD
const comparePassword = async (password, hashedPassword) => {

    return bcrypt.compare(password, hashedPassword);
};



// GENERATE JWT
const generateToken = (payload) => {

    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};



module.exports = {
    hashPassword,
    comparePassword,
    generateToken
};