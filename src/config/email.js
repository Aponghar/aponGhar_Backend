const { Resend } = require("resend");

// EMAIL_PASS is where the user will provide their Resend API key (e.g. re_...)
const resend = new Resend(process.env.EMAIL_PASS);

module.exports = resend;
