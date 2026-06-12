const ownerService =
    require("./ownerService");

const {
    ownerApplicationSchema
} = require("./ownerValidation");



const applyForOwner =
    async (req, res, next) => {

        try {

            const { error } =

                ownerApplicationSchema
                    .validate(req.body);

            if (error) {

                return res.status(400).json({
                    success: false,
                    message:
                        error.details[0].message
                });
            }

            const result =
                await ownerService
                    .submitApplication(
                        req.user.id,
                        req.body
                    );

            res.status(201).json({
                success: true,
                data: result
            });

        } catch (error) {

            next(error);
        }
};

const getApplications =
    async (req, res, next) => {

        try {

            const applications =
                await ownerService
                    .getApplications();

            res.status(200).json({
                success: true,
                data: applications
            });

        } catch (error) {

            next(error);
        }
};

const approveApplication =
    async (req, res, next) => {

        try {

            const { id } = req.params;

            const { admin_message } =
                req.body;

            const result =
                await ownerService
                    .approveApplication(
                        id,
                        admin_message
                    );

            res.status(200).json({
                success: true,
                data: result
            });

        } catch (error) {

            next(error);
        }
};

const rejectApplication =
    async (req, res, next) => {

        try {

            const { id } = req.params;

            const { admin_message } =
                req.body;

            const result =
                await ownerService
                    .rejectApplication(
                        id,
                        admin_message
                    );

            res.status(200).json({
                success: true,
                data: result
            });

        } catch (error) {

            next(error);
        }
};




module.exports = {
    applyForOwner,
    getApplications,
    approveApplication,
    rejectApplication
};