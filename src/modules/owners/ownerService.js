const ownerRepository =
    require("./ownerRepository");



const submitApplication =
    async (userId, applicationData) => {

        const existingApplication =

            await ownerRepository
                .findApplicationByUserId(
                    userId
                );

        if (existingApplication) {
            const error = new Error(
                "Application already submitted, team will contact you"
            );
            error.statusCode = 400;
            throw error;
        }

        applicationData.user_id = userId;

        await ownerRepository
            .createOwnerApplication(
                applicationData
            );

        return {
            message:
                "Owner application submitted successfully"
        };
};

const getApplications =
    async () => {

        return ownerRepository
            .getAllApplications();
};

const approveApplication =
    async (
        applicationId,
        adminMessage
    ) => {

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

        if (
            application.status !==
            "PENDING"
        ) {

            throw new Error(
                "Application already processed"
            );
        }

        // APPROVE APPLICATION
        await ownerRepository
            .updateApplicationStatus(

                applicationId,

                "APPROVED",

                adminMessage
            );

        // UPDATE USER ROLE
        await ownerRepository
            .updateUserRole(

                application.user_id,

                "OWNER"
            );

        return {
            message:
                "Application approved successfully"
        };
};

const rejectApplication =
    async (
        applicationId,
        adminMessage
    ) => {

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

        if (
            application.status !==
            "PENDING"
        ) {

            throw new Error(
                "Application already processed"
            );
        }

        await ownerRepository
            .updateApplicationStatus(

                applicationId,

                "REJECTED",

                adminMessage
            );

        return {
            message:
                "Application rejected successfully"
        };
};

module.exports = {
    submitApplication,
    getApplications,
    approveApplication,
    rejectApplication
};
