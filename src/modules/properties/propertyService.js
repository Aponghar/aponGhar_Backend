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

        // CHECK PHOTO LIMIT (MAX 5)
        const existingImages = await propertyRepository.getPropertyImages(propertyId);
        if (existingImages.length + files.length > 5) {
            const error = new Error(`Property photo limit reached. A property can have a maximum of 5 photos. Current photos: ${existingImages.length}`);
            error.statusCode = 400;
            throw error;
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
    async (page, limit) => {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const offset = (pageNum - 1) * limitNum;

        // Fetch properties
        const properties = await propertyRepository
            .getAllProperties(limitNum, offset);

        const total = await propertyRepository
            .countAllProperties();

        if (properties.length === 0) {
            return {
                properties: [],
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum)
                }
            };
        }

        // Get bulk rooms
        const propertyIds = properties.map(p => p.id);
        const allRooms = await propertyRepository
            .getRoomsForProperties(propertyIds);

        // Group rooms by property ID
        const roomsByProperty = {};
        allRooms.forEach(room => {
            if (!roomsByProperty[room.property_id]) {
                roomsByProperty[room.property_id] = [];
            }
            roomsByProperty[room.property_id].push(room);
        });

        // Enrich properties
        const enrichedProperties = properties.map(property => {
            const rooms = roomsByProperty[property.id] || [];
            const allPriceEntries = [];
            let maxGuests = 0;
            let hasNightly = false;
            let hasHourly = false;
            const roomTypes = new Set();
            const roomAmenityIds = new Set();
            const roomAmenityGroups = [];

            rooms.forEach((room) => {
                const commission = Number(room.commission_percentage) || 0;
                const multiplier = 1 + (commission / 100);
                const applyCommission = (price) => {
                    const p = Number(price) || 0;
                    return p > 0 ? Math.round(p * multiplier) : 0;
                };
                
                const prices = [
                    { amount: applyCommission(room.price_per_night), period: "/night" },
                    { amount: applyCommission(room.price_3hours), period: "/3h" },
                    { amount: applyCommission(room.price_6hours), period: "/6h" },
                    { amount: applyCommission(room.price_9hours), period: "/9h" },
                    { amount: applyCommission(room.base_price), period: "" }
                ].filter(p => p.amount > 0);

                prices.forEach((entry) => allPriceEntries.push(entry));

                const pricePerNight = Number(room.price_per_night) || 0;
                const hourlyCandidates = [
                    Number(room.price_3hours) || 0,
                    Number(room.price_6hours) || 0,
                    Number(room.price_9hours) || 0
                ];

                if (pricePerNight > 0) {
                    hasNightly = true;
                }

                if (hourlyCandidates.some((price) => price > 0)) {
                    hasHourly = true;
                }

                const adults = Number(room.max_adults) || 0;
                const children = Number(room.max_children) || 0;
                maxGuests = Math.max(maxGuests, adults + children);

                if (room.room_type) {
                    roomTypes.add(String(room.room_type).trim());
                }

                const currentRoomAmenityIds = [];
                const parsedRoomAmenities = (() => {
                    const val = room.room_amenities;
                    if (!val) return [];
                    if (Array.isArray(val)) return val;
                    if (typeof val === "string") {
                        try {
                            const parsed = JSON.parse(val);
                            return Array.isArray(parsed) ? parsed : [];
                        } catch (e) {
                            return [];
                        }
                    }
                    return [];
                })();

                parsedRoomAmenities.forEach((amenity) => {
                    const amenityId = Number(amenity);
                    if (Number.isFinite(amenityId)) {
                        roomAmenityIds.add(amenityId);
                        currentRoomAmenityIds.push(amenityId);
                    }
                });

                roomAmenityGroups.push([...new Set(currentRoomAmenityIds)]);
            });

            const fallbackPrice = Number(property.price_per_night) || 0;
            if (fallbackPrice > 0) {
                allPriceEntries.push({ amount: fallbackPrice, period: "/night" });
            }

            const cheapestEntry = allPriceEntries.length > 0
                ? allPriceEntries.reduce((lowest, current) => {
                    return current.amount < lowest.amount ? current : lowest;
                })
                : null;

            return {
                ...property,
                effective_price: cheapestEntry ? cheapestEntry.amount : fallbackPrice,
                effective_price_period: cheapestEntry ? cheapestEntry.period : (fallbackPrice > 0 ? "/night" : ""),
                max_guests: maxGuests,
                has_nightly: hasNightly || fallbackPrice > 0,
                has_hourly: hasHourly,
                room_types: [...roomTypes],
                room_amenity_ids: [...roomAmenityIds],
                room_amenity_groups: roomAmenityGroups
            };
        });

        return {
            properties: enrichedProperties,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        };
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
