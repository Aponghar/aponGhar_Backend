const adService = require("./adService");

const createAd = async (req, res, next) => {
  try {
    const adData = {
      image_url: req.file ? req.file.path : null,
      redirect_url: req.body.redirect_url
    };
    const result = await adService.createAd(adData);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getActiveAds = async (req, res, next) => {
  try {
    const ads = await adService.getActiveAds();
    res.status(200).json({
      success: true,
      data: ads
    });
  } catch (error) {
    next(error);
  }
};

const getAllAds = async (req, res, next) => {
  try {
    const ads = await adService.getAllAds();
    res.status(200).json({
      success: true,
      data: ads
    });
  } catch (error) {
    next(error);
  }
};

const deleteAd = async (req, res, next) => {
  try {
    const result = await adService.deleteAd(req.params.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAd,
  getActiveAds,
  getAllAds,
  deleteAd
};
