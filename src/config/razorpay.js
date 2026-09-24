const Razorpay = require("razorpay");

let razorpayInstance = null;

function getRazorpay() {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        return new Proxy({}, {
            get(target, prop) {
                if (prop === "orders" || prop === "payments") {
                    return new Proxy({}, {
                        get() {
                            return async () => {
                                throw new Error("Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are not configured in environment variables.");
                            };
                        }
                    });
                }
                return target[prop];
            }
        });
    }

    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id,
            key_secret
        });
    }
    return razorpayInstance;
}

const razorpayProxy = new Proxy({}, {
    get(target, prop) {
        const instance = getRazorpay();
        const value = instance[prop];
        return typeof value === "function" ? value.bind(instance) : value;
    }
});

module.exports = razorpayProxy;