const adminRepository =
    require("./adminRepository");

const ownerRepository =
    require("../owners/ownerRepository");

const walletRepository =
    require("../wallets/walletRepository");

const notificationService =
    require("../notifications/notificationService");

const getDashboard =
    async () => {

        return adminRepository
            .getDashboardStats();
};

const getUsers =
    async () => {

        return adminRepository
            .getAllUsers();
};

const getPendingApplications =
    async () => {

        return adminRepository
            .getPendingOwnerApplications();
};

const approveOwnerApplication =
    async (applicationId) => {

        // GET APPLICATION
        const application =
            await ownerRepository
                .getApplicationById(
                    applicationId
                );

        if (!application) {

            throw new Error(
                "Application not found"
            );
        }

        // UPDATE APPLICATION
        await adminRepository
            .updateOwnerApplication(

                applicationId,

                "APPROVED"
            );

        // UPDATE USER ROLE
        await adminRepository
            .updateUserRole(

                application.user_id,

                "OWNER"
            );

        return {

            message:
                "Owner application approved"
        };
};

const rejectOwnerApplication =
    async (applicationId) => {

        const application =
            await ownerRepository
                .getApplicationById(
                    applicationId
                );

        if (!application) {

            throw new Error(
                "Application not found"
            );
        }

        await adminRepository
            .updateOwnerApplication(

                applicationId,

                "REJECTED"
            );

        return {

            message:
                "Owner application rejected"
        };
};

const getPendingProperties =
    async () => {

        return adminRepository
            .getPendingProperties();
};

const approveProperty =
    async (propertyId) => {

        await adminRepository
            .updatePropertyStatus(

                propertyId,

                "APPROVED"
            );

        return {

            message:
                "Property approved successfully"
        };
};

const rejectProperty =
    async (propertyId) => {

        await adminRepository
            .updatePropertyStatus(

                propertyId,

                "REJECTED"
            );

        return {

            message:
                "Property rejected successfully"
        };
};

const getBookings =
    async () => {

        return adminRepository
            .getAllBookings();
};

const getRefunds =
    async () => {

        return adminRepository
            .getRefundBookings();
};

const monthlyRevenue =
    async () => {

        return adminRepository
            .getMonthlyRevenue();
};

const refundAnalytics =
    async () => {

        return adminRepository
            .getRefundAnalytics();
};

const bookingAnalytics =
    async () => {

        return adminRepository
            .getBookingStatusAnalytics();
};

const topProperties =
    async () => {

        return adminRepository
            .getTopPerformingProperties();
};

const ownerPerformance =
    async () => {

        return adminRepository
            .getOwnerPerformance();
};

const platformKPIs =
    async () => {

        return adminRepository
            .getPlatformKPIs();
};

const getApprovedOwners =
async () => {

    return adminRepository
    .getApprovedOwners();
};

const getAllProperties =
async () => {

    return adminRepository
    .getAllProperties();
};

const deactivatePropertyByAdmin =
async (propertyId) => {

    const property =
    await adminRepository
    .getPropertyById(propertyId);

    if (!property) {

        throw new Error(
            "Property not found"
        );
    }

    await adminRepository
    .deactivatePropertyByAdmin(propertyId);

    return {

        message:
        "Property deactivated successfully"
    };
};

const activatePropertyByAdmin =
async (propertyId) => {

    const property =
    await adminRepository
    .getPropertyById(propertyId);

    if (!property) {

        throw new Error(
            "Property not found"
        );
    }

    await adminRepository
    .activatePropertyByAdmin(propertyId);

    return {

        message:
        "Property activated successfully"
    };
};

const deletePropertyByAdmin =
async (propertyId) => {

    const property =
    await adminRepository
    .getPropertyById(propertyId);

    if (!property) {

        throw new Error(
            "Property not found"
        );
    }

    await adminRepository
    .deletePropertyByAdmin(propertyId);

    return {

        message:
        "Property deleted successfully"
    };
};

const setPropertyCommission =
async (propertyId, commissionPercentage) => {

    const commission = Number(commissionPercentage);

    if (
        !Number.isFinite(commission) ||
        commission < 0 ||
        commission > 100
    ) {

        throw new Error(
            "Commission must be between 0 and 100"
        );
    }

    const property =
    await adminRepository
    .getPropertyById(propertyId);

    if (!property) {

        throw new Error(
            "Property not found"
        );
    }

    await adminRepository
    .updatePropertyCommission(
        propertyId,
        commission
    );

    return {

        message:
        `Commission set to ${commission}% for ${property.property_name}`
    };
};

const requestCommissionPayment =
async (commissionId) => {

    const commission =
    await adminRepository
    .getCommissionById(commissionId);

    if (!commission) {

        throw new Error(
            "Commission not found"
        );
    }

    if (commission.payment_status === 'PAID') {

        throw new Error(
            "Commission already paid"
        );
    }

    await adminRepository
    .updateCommissionRequestTimestamp(
        commissionId
    );

    return {

        message:
        "Payment request sent to owner"
    };
};

const confirmCommissionPayment =
async (commissionId, paymentProofNotes) => {

    const commission =
    await adminRepository
    .getCommissionById(commissionId);

    if (!commission) {

        throw new Error(
            "Commission not found"
        );
    }

    if (commission.payment_status === 'PAID') {

        throw new Error(
            "Commission already marked as paid"
        );
    }

    await adminRepository
    .updateCommissionPaidStatus(
        commissionId,
        paymentProofNotes
    );

    return {

        message:
        "Commission payment confirmed"
    };
};

const getCommissionsByOwner =
async (ownerId) => {

    const commissions =
    await adminRepository
    .getPendingCommissionsByOwner(ownerId);

    return commissions;
};

const creditUserWallet =
async (userId, amount, adminMessage) => {

    // Get user to determine wallet type
    const [users] = await adminRepository
        .getUserById(userId);

    const user = users[0];

    if (!user) {
        throw new Error("User not found");
    }

    // Determine wallet type based on user role
    const walletType = user.role === 'OWNER' ? 'OWNER' : 'USER';

    // Get or create wallet
    const wallet =
        await walletRepository
            .getOrCreateWallet(userId, walletType);

    if (!wallet) {
        throw new Error("Failed to create or get wallet");
    }

    // Credit the wallet
    const creditResult =
        await walletRepository.creditWallet(
            wallet.id,
            amount,
            `Admin credit: ${adminMessage}`
        );

    // Create in-app notification
    await notificationService
        .createNotification({
            user_id: userId,
            title: "Wallet Credit",
            message: `Your wallet has been credited with ₹${amount}. Message: ${adminMessage}`,
            notification_type: "WALLET"
        });

    // Send email notification
    await notificationService.sendEmail(
        user.email,
        "Wallet Credit - AponGhar",
        `<h2>Your wallet has been credited!</h2>
         <p>Amount: ₹${amount}</p>
         <p>Message from Admin: ${adminMessage}</p>
         <p>Your new wallet balance: ₹${creditResult.newBalance}</p>`
    );

    return {
        message: "Wallet credited successfully",
        walletId: wallet.id,
        userId,
        amount,
        newBalance: creditResult.newBalance,
        transactionId: creditResult.transactionId
    };
};

const getRecentWalletCredits = async () => {
    return await adminRepository.getRecentWalletCredits();
};

module.exports = {

    getDashboard,

    getUsers,

    getPendingApplications,

    approveOwnerApplication,

    rejectOwnerApplication,

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

    setPropertyCommission,

    requestCommissionPayment,

    confirmCommissionPayment,

    getCommissionsByOwner,

    creditUserWallet,

    getRecentWalletCredits
};

