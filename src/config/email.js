const { Resend } = require("resend");

// Prefer RESEND_API_KEY, fallback to EMAIL_PASS if configured with a Resend key (e.g. re_...)
const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_PASS;
let resend;

if (apiKey && apiKey.startsWith("re_")) {
    resend = new Resend(apiKey);
} else {
    // Graceful fallback to avoid crashing entire server on startup when email key is not set
    resend = {
        emails: {
            send: async (data) => {
                if (process.env.NODE_ENV === "production" && !apiKey) {
                    throw new Error("Resend API key is not configured. Please set RESEND_API_KEY in environment variables.");
                }
                console.warn("[Email Service] Resend API key missing or invalid. Simulated email to:", data.to, "Subject:", data.subject);
                return { data: { id: "simulated_email_id" }, error: null };
            }
        }
    };
}

module.exports = resend;
