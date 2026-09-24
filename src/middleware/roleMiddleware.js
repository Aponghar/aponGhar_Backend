const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            // CHECK USER EXISTS
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized access"
                });
            }

            // CHECK ROLE (ADMIN has platform super-user access)
            if (
                !allowedRoles.includes(req.user.role) &&
                req.user.role !== "ADMIN"
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }

            next();

        } catch (error) {
            next(error);
        }
    };
};

module.exports = roleMiddleware;