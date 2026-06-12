const propertyRepository =
    require("./propertyRepository");

const normalizeCoordinates = (propertyData) => {
    if (propertyData.latitude === "" || propertyData.latitude === undefined) {
        propertyData.latitude = null;
    } else if (propertyData.latitude !== null) {
        propertyData.latitude = Number(propertyData.latitude);
    }

    if (propertyData.longitude === "" || propertyData.longitude === undefined) {
        propertyData.longitude = null;
    } else if (propertyData.longitude !== null) {
        propertyData.longitude = Number(propertyData.longitude);
    }
};



const addProperty =
    async (ownerId, propertyData) => {

        propertyData.owner_id = ownerId;
        normalizeCoordinates(propertyData);

        const result = await propertyRepository
            .createProperty(propertyData);

        return {

            message:
                "Property added successfully",
            propertyId: result.insertId
        };
};



const getMyProperties =
    async (ownerId) => {

        return propertyRepository
            .getOwnerProperties(ownerId);
};

const uploadPropertyImages =
    async (
        ownerId,
        propertyId,
        files
    ) => {

        // VERIFY OWNERSHIP
        const property =
            await propertyRepository
                .verifyPropertyOwnership(
                    propertyId,
                    ownerId
                );

        if (!property) {

            throw new Error(
                "Property not found or unauthorized"
            );
        }

        // SAVE IMAGES
        for (const file of files) {

            await propertyRepository
                .createPropertyImage(

                    propertyId,

                    file.path
                );
        }

        return {

            message:
                "Property images uploaded successfully"
        };
};

const getPropertyGallery =
    async (
        propertyId
    ) => {

        return propertyRepository
            .getPropertyImages(
                propertyId
            );
};

const editProperty =
    async (
        ownerId,
        propertyId,
        propertyData
    ) => {

        // VERIFY OWNERSHIP
        const property =
            await propertyRepository
                .verifyPropertyOwnership(
                    propertyId,
                    ownerId
                );

        if (!property) {

            throw new Error(
                "Property not found or unauthorized"
            );
        }

        normalizeCoordinates(propertyData);

        await propertyRepository
            .updateProperty(
                propertyId,
                propertyData
            );

        return {

            message:
                "Property updated successfully"
        };
};

const deleteProperty =
    async (
        ownerId,
        propertyId
    ) => {

        // VERIFY OWNERSHIP
        const property =
            await propertyRepository
                .verifyPropertyOwnership(
                    propertyId,
                    ownerId
                );

        if (!property) {

            throw new Error(
                "Property not found or unauthorized"
            );
        }

        await propertyRepository
            .deactivateProperty(
                propertyId
            );

        return {

            message:
                "Property deleted successfully"
        };
};

const assignAmenities =
    async (
        ownerId,
        propertyId,
        amenityIds
    ) => {

        // VERIFY OWNERSHIP
        const property =
            await propertyRepository
                .verifyPropertyOwnership(
                    propertyId,
                    ownerId
                );

        if (!property) {

            throw new Error(
                "Property not found or unauthorized"
            );
        }

        // ADD AMENITIES
        for (const amenityId of amenityIds) {

            await propertyRepository
                .addPropertyAmenity(

                    propertyId,

                    amenityId
                );
        }

        return {

            message:
                "Amenities added successfully"
        };
};

const getAmenities =
    async (propertyId) => {

        return propertyRepository
            .getPropertyAmenities(
                propertyId
            );
};

const getAmenitiesList =
    async () => {

        return propertyRepository
            .getAllAmenities();
};

const addPropertyRules =
    async (
        ownerId,
        propertyId,
        rules
    ) => {

        // VERIFY OWNERSHIP
        const property =
            await propertyRepository
                .verifyPropertyOwnership(
                    propertyId,
                    ownerId
                );

        if (!property) {

            throw new Error(
                "Property not found or unauthorized"
            );
        }

        // ADD RULES
        for (const rule of rules) {

            await propertyRepository
                .createPropertyRule(

                    propertyId,

                    rule.rule_type,

                    rule.rule_value
                );
        }

        return {

            message:
                "Property rules added successfully"
        };
};

const getRules =
    async (propertyId) => {

        return propertyRepository
            .getPropertyRules(
                propertyId
            );
};

const editRule =
    async (
        ownerId,
        propertyId,
        ruleId,
        ruleValue
    ) => {

        // VERIFY OWNERSHIP
        const property =
            await propertyRepository
                .verifyPropertyOwnership(
                    propertyId,
                    ownerId
                );

        if (!property) {

            throw new Error(
                "Property not found or unauthorized"
            );
        }

        await propertyRepository
            .updatePropertyRule(
                ruleId,
                ruleValue
            );

        return {

            message:
                "Property rule updated successfully"
        };
};

const searchRooms =
    async (filters) => {

        const {

            city,

            check_in,

            check_out,

            guests,

            min_price = 0,

            max_price = 999999,

            room_type,

            amenities,

            sort_by,

            page = 1,

            limit = 10

        } = filters;

        // DATE VALIDATION
        const checkIn =
            new Date(check_in);

        const checkOut =
            new Date(check_out);

        if (checkOut <= checkIn) {

            throw new Error(
                "Invalid booking dates"
            );
        }

        let parsedAmenities = [];

        if (amenities) {

            parsedAmenities =
                amenities.split(",");
        }

        // GET SEARCH RESULTS
        const rooms =
            await propertyRepository
                .searchAvailableRooms({

                    city,

                    check_in,

                    check_out,

                    guests,

                    min_price,

                    max_price,

                    room_type,

                    amenities:
                        parsedAmenities,

                    sort_by,

                    page,

                    limit
                });

        // GET TOTAL COUNT
        const totalResults =
            await propertyRepository
                .countSearchResults({

                    city,

                    check_in,

                    check_out,

                    guests,

                    min_price,

                    max_price,

                    room_type
                });

        return {

            pagination: {

                current_page:
                    Number(page),

                per_page:
                    Number(limit),

                total_results:
                    totalResults,

                total_pages:
                    Math.ceil(
                        totalResults / limit
                    )
            },

            rooms
        };
};

const getFeatured =
    async () => {

        return propertyRepository
            .getFeaturedProperties();
};

const getTrending =
    async () => {

        return propertyRepository
            .getTrendingProperties();
};

const getTopRated =
    async () => {

        return propertyRepository
            .getTopRatedProperties();
};

const getPropertyDetails =
    async (propertyId) => {

        const property =
            await propertyRepository
                .getCompletePropertyDetails(
                    propertyId
                );

        if (!property) {

            throw new Error(
                "Property not found"
            );
        }

        return property;
};

const getAllPublicProperties =
    async () => {

        return propertyRepository
            .getAllProperties();
};


module.exports = {

    addProperty,
    getMyProperties,
    uploadPropertyImages,
    getPropertyGallery,
    editProperty,
    deleteProperty,
    assignAmenities,
    getAmenities,
    getAmenitiesList,
    addPropertyRules,
    getRules,
    editRule,
    searchRooms,
    getFeatured,
    getTrending,
    getTopRated,
    getPropertyDetails,
    getAllPublicProperties
};
