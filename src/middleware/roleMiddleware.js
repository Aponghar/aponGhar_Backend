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

            // CHECK ROLE
            if (
                !allowedRoles.includes(req.user.role)
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