const adminService =
    require("./adminService");

const dashboard =
    async (req, res, next) => {

        try {

            const data =
                await adminService
                    .getDashboard();

            res.status(200).json({

                success: true,

                data
            });

        } catch (error) {

            next(error);
        }
};

const getUsers =
    async (req, res, next) => {

        try {

            const users =
                await adminService
                    .getUsers();

            res.status(200).json({

                success: true,

                data: users
            });

        } catch (error) {

            next(error);
        }
};

const getPendingApplications =
    async (req, res, next) => {

        try {

            const applications =
                await adminService
                    .getPendingApplications();

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

            const { applicationId } =
                req.params;

            const result =
                await adminService
                    .approveOwnerApplication(
                        applicationId
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

            const { applicationId } =
                req.params;

            const result =
                await adminService
                    .rejectOwnerApplication(
                        applicationId
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const getPendingProperties =
    async (req, res, next) => {

        try {

            const properties =
                await adminService
                    .getPendingProperties();

            res.status(200).json({

                success: true,

                data: properties
            });

        } catch (error) {

            next(error);
        }
};

const approveProperty =
    async (req, res, next) => {

        try {

            const { propertyId } =
                req.params;

            const result =
                await adminService
                    .approveProperty(
                        propertyId
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const rejectProperty =
    async (req, res, next) => {

        try {

            const { propertyId } =
                req.params;

            const result =
                await adminService
                    .rejectProperty(
                        propertyId
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const getBookings =
    async (req, res, next) => {

        try {

            const bookings =
                await adminService
                    .getBookings();

            res.status(200).json({

                success: true,

                data: bookings
            });

        } catch (error) {

            next(error);
        }
};

const getRefunds =
    async (req, res, next) => {

        try {

            const refunds =
                await adminService
                    .getRefunds();

            res.status(200).json({

                success: true,

                data: refunds
            });

        } catch (error) {

            next(error);
        }
};

const monthlyRevenue =
    async (req, res, next) => {

        try {

            const data =
                await adminService
                    .monthlyRevenue();

            res.status(200).json({

                success: true,

                data
            });

        } catch (error) {

            next(error);
        }
};

const refundAnalytics =
    async (req, res, next) => {

        try {

            const data =
                await adminService
                    .refundAnalytics();

            res.status(200).json({

                success: true,

                data
            });

        } catch (error) {

            next(error);
        }
};

const bookingAnalytics =
    async (req, res, next) => {

        try {

            const data =
                await adminService
                    .bookingAnalytics();

            res.status(200).json({

                success: true,

                data
            });

        } catch (error) {

            next(error);
        }
};

const topProperties =
    async (req, res, next) => {

        try {

            const data =
                await adminService
                    .topProperties();

            res.status(200).json({

                success: true,

                data
            });

        } catch (error) {

            next(error);
        }
};
const ownerPerformance =
    async (req, res, next) => {

        try {

            const data =
                await adminService
                    .ownerPerformance();

            res.status(200).json({

                success: true,

                data
            });

        } catch (error) {

            next(error);
        }
};

const platformKPIs =
    async (req, res, next) => {

        try {

            const data =
                await adminService
                    .platformKPIs();

            res.status(200).json({

                success: true,

                data
            });

        } catch (error) {

            next(error);
        }
};

const getApprovedOwners =
async (req, res, next) => {

    try {

        const owners =
        await adminService
        .getApprovedOwners();

        res.status(200).json({

            success:true,

            data:owners
        });

    } catch (error) {

        next(error);
    }
};

const getAllProperties =
async (req,res,next) => {

    try {

        const properties =
        await adminService
        .getAllProperties();

        res.status(200).json({

            success:true,

            data:properties
        });

    } catch(error){

        next(error);
    }
};

const deactivatePropertyByAdmin =
async (req, res, next) => {

    try {

        const { propertyId } =
        req.params;

        const result =
        await adminService
        .deactivatePropertyByAdmin(propertyId);

        res.status(200).json({

            success: true,

            data: result
        });

    } catch (error) {

        next(error);
    }
};

const activatePropertyByAdmin =
async (req, res, next) => {

    try {

        const { propertyId } =
        req.params;

        const result =
        await adminService
        .activatePropertyByAdmin(propertyId);

        res.status(200).json({

            success: true,

            data: result
        });

    } catch (error) {

        next(error);
    }
};

const deletePropertyByAdmin =
async (req, res, next) => {

    try {

        const { propertyId } =
        req.params;

        const result =
        await adminService
        .deletePropertyByAdmin(propertyId);

        res.status(200).json({

            success: true,

            data: result
        });

    } catch (error) {

        next(error);
    }
};
const setCommission =
async (req, res, next) => {

    try {

        const { propertyId } =
        req.params;

        const { commission_percentage } =
        req.body;

        const result =
        await adminService
        .setPropertyCommission(
            propertyId,
            commission_percentage
        );

        res.status(200).json({

            success: true,

            data: result
        });

    } catch (error) {

        next(error);
    }
};

const getPendingCheckIns =
async (req, res, next) => {

    try {

        const checkinService =
        require("../checkins/checkinService");

        const checkIns =
        await checkinService
        .getPendingCheckInsAdmin();

        res.status(200).json({

            success: true,

            data: checkIns
        });

    } catch (error) {

        next(error);
    }
};

const recordCheckInAdmin =
async (req, res, next) => {

    try {

        const { checkinId } = req.params;

        const checkinService =
        require("../checkins/checkinService");

        const result =
        await checkinService
        .recordCheckIn(checkinId);

        res.status(200).json({

            success: true,

            data: result
        });

    } catch (error) {

        next(error);
    }
};

const getEarnings =
async (req, res, next) => {

    try {

        const checkinService =
        require("../checkins/checkinService");

        const filters = {
            propertyId: req.query.property_id,
            status: req.query.status,
            requestState: req.query.request_state
        };

        const commissions =
        await checkinService
        .getCommissionsForAdmin(filters);

        const summary =
        await checkinService
        .getCommissionSummaryData(filters);

        res.status(200).json({

            success: true,

            data: {
                commissions,
                summary
            }
        });

    } catch (error) {

        next(error);
    }
};

const requestCommissionPayment =
    async (req, res, next) => {

        try {

            const { commissionId } =
                req.params;

            const result =
                await adminService
                    .requestCommissionPayment(
                        commissionId
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
    };

const confirmCommissionPayment =
    async (req, res, next) => {

        try {

            const { commissionId } =
                req.params;

            const { payment_proof_notes } =
                req.body;

            const result =
                await adminService
                    .confirmCommissionPayment(
                        commissionId,
                        payment_proof_notes
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
    };

const getCommissionsByOwner =
    async (req, res, next) => {

        try {

            const { ownerId } =
                req.params;

            const commissions =
                await adminService
                    .getCommissionsByOwner(
                        ownerId
                    );

            res.status(200).json({

                success: true,

                data: commissions
            });

        } catch (error) {

            next(error);
        }
    };

const creditWallet =
    async (req, res, next) => {

        try {

            const { user_id, amount, admin_message } =
                req.body;

            if (!user_id || !amount || !admin_message) {
                return res.status(400).json({
                    success: false,
                    message: "user_id, amount, and admin_message are required"
                });
            }

            if (isNaN(amount) || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Amount must be a positive number"
                });
            }

            const result =
                await adminService
                    .creditUserWallet(
                        user_id,
                        amount,
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

    dashboard,

    getUsers,

    getPendingApplications,

    approveApplication,

    rejectApplication,

    getPendingProperties,

    approveProperty,

    rejectProperty,

    getBookings,

    getRefunds,

    monthlyRevenue,

    refundAnalytics,

    bookingAnalytics,

    topProperties,

    ownerPerformance,

    platformKPIs,

    getApprovedOwners,

    getAllProperties,

    deactivatePropertyByAdmin,

    activatePropertyByAdmin,

    deletePropertyByAdmin,

    setCommission,

    getPendingCheckIns,

    recordCheckInAdmin,

    getEarnings,

    requestCommissionPayment,

    confirmCommissionPayment,

    getCommissionsByOwner,

    creditWallet
};
