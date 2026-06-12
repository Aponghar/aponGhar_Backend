const propertyService =
    require("./propertyService");

const {
    propertySchema
} = require("./propertyValidation");



const createProperty =
    async (req, res, next) => {

        try {

            const { error } =

                propertySchema
                    .validate(req.body);

            if (error) {

                return res.status(400).json({

                    success: false,

                    message:
                        error.details[0].message
                });
            }

            const property_image =
                req.file
                    ? req.file.path.replace(/\\/g, "/")
                    : null;

            const result =
                await propertyService
                    .addProperty(
                        req.user.id,

                        {
                            ...req.body,

                            property_image
                        }
                    );

            res.status(201).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};



const getMyProperties =
    async (req, res, next) => {

        try {

            const properties =
                await propertyService
                    .getMyProperties(
                        req.user.id
                    );

            res.status(200).json({

                success: true,

                data: properties
            });

        } catch (error) {

            next(error);
        }
};

const uploadImages =
    async (req, res, next) => {

        try {

            const { propertyId } =
                req.params;

            if (
                !req.files ||
                req.files.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No files uploaded"
                });
            }

            const result =
                await propertyService
                    .uploadPropertyImages(

                        req.user.id,

                        propertyId,

                        req.files
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const getGallery =
    async (req, res, next) => {

        try {

            const { propertyId } =
                req.params;

            const images =
                await propertyService
                    .getPropertyGallery(
                        propertyId
                    );

            res.status(200).json({

                success: true,

                data: images
            });

        } catch (error) {

            next(error);
        }
};
const updateProperty =
    async (req, res, next) => {

        try {

            const { propertyId } =
                req.params;

            const { error } =

                propertySchema
                    .validate(req.body);

            if (error) {

                return res.status(400).json({

                    success: false,

                    message:
                        error.details[0].message
                });
            }

            const result =
                await propertyService
                    .editProperty(

                        req.user.id,

                        propertyId,

                        req.body
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const deleteProperty =
    async (req, res, next) => {

        try {

            const { propertyId } =
                req.params;

            const result =
                await propertyService
                    .deleteProperty(

                        req.user.id,

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

const addAmenities =
    async (req, res, next) => {

        try {

            const { propertyId } =
                req.params;

            const { amenity_ids } =
                req.body;

            const result =
                await propertyService
                    .assignAmenities(

                        req.user.id,

                        propertyId,

                        amenity_ids
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const getAmenities =
    async (req, res, next) => {

        try {

            const { propertyId } =
                req.params;

            const amenities =
                await propertyService
                    .getAmenities(
                        propertyId
                    );

            res.status(200).json({

                success: true,

                data: amenities
            });

        } catch (error) {

            next(error);
        }
};

const getAllAmenities =
    async (req, res, next) => {

        try {

            const amenities =
                await propertyService
                    .getAmenitiesList();

            res.status(200).json({

                success: true,

                data: amenities
            });

        } catch (error) {

            next(error);
        }
};

const addRules =
    async (req, res, next) => {

        try {

            const { propertyId } =
                req.params;

            const { rules } =
                req.body;

            const result =
                await propertyService
                    .addPropertyRules(

                        req.user.id,

                        propertyId,

                        rules
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const getRules =
    async (req, res, next) => {

        try {

            const { propertyId } =
                req.params;

            const rules =
                await propertyService
                    .getRules(
                        propertyId
                    );

            res.status(200).json({

                success: true,

                data: rules
            });

        } catch (error) {

            next(error);
        }
};

const updateRule =
    async (req, res, next) => {

        try {

            const { propertyId } =
                req.params;

            const { ruleId } =
                req.params;

            const { rule_value } =
                req.body;

            const result =
                await propertyService
                    .editRule(

                        req.user.id,

                        propertyId,

                        ruleId,

                        rule_value
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const searchRooms =
    async (req, res, next) => {

        try {

            const result =
                await propertyService
                    .searchRooms(
                        req.query
                    );

            res.status(200).json({

                success: true,

                pagination:
                    result.pagination,

                results:
                    result.rooms.length,

                data:
                    result.rooms
            });

        } catch (error) {

            next(error);
        }
};

const getFeaturedProperties =
    async (req, res, next) => {

        try {

            const properties =
                await propertyService
                    .getFeatured();

            res.status(200).json({

                success: true,

                data: properties
            });

        } catch (error) {

            next(error);
        }
};

const getTrendingProperties =
    async (req, res, next) => {

        try {

            const properties =
                await propertyService
                    .getTrending();

            res.status(200).json({

                success: true,

                data: properties
            });

        } catch (error) {

            next(error);
        }
};

const getTopRatedProperties =
    async (req, res, next) => {

        try {

            const properties =
                await propertyService
                    .getTopRated();

            res.status(200).json({

                success: true,

                data: properties
            });

        } catch (error) {

            next(error);
        }
};

const getPropertyDetails =
    async (req, res, next) => {

        try {

            const { propertyId } =
                req.params;

            const property =
                await propertyService
                    .getPropertyDetails(
                        propertyId
                    );

            res.status(200).json({

                success: true,

                data: property
            });

        } catch (error) {

            next(error);
        }
};

const getAllProperties =
    async (req, res, next) => {

        try {

            const properties =
                await propertyService
                    .getAllPublicProperties();

            res.status(200).json({

                success: true,

                data: properties
            });

        } catch (error) {

            next(error);
        }
};


module.exports = {

    createProperty,

    getMyProperties,

    uploadImages,

    getGallery,

    updateProperty,

    deleteProperty,

    addAmenities,

    getAmenities,

    getAllAmenities,

    addRules,

    getRules,

    updateRule,

    searchRooms,

    getFeaturedProperties,

    getTrendingProperties,

    getTopRatedProperties,

    getPropertyDetails,

    getAllProperties

};