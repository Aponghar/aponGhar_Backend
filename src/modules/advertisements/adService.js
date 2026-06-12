const adRepository = require("./adRepository");

const createAd = async (adData) => {
  if (!adData.image_url) {
    throw new Error("Ad image is required");
  }
  if (!adData.redirect_url) {
    throw new Error("Redirect URL is required");
  }
  
  // Basic URL regex check
  try {
    new URL(adData.redirect_url);
  } catch (err) {
    throw new Error("Invalid redirect URL format");
  }

  return await adRepository.createAd(adData);
};

const getActiveAds = async () => {
  return await adRepository.getActiveAds();
};

const getAllAds = async () => {
  return await adRepository.getAllAds();
};

const deleteAd = async (id) => {
  if (!id) {
    throw new Error("Ad ID is required");
  }
  return await adRepository.deleteAd(id);
};

module.exports = {
  createAd,
  getActiveAds,
  getAllAds,
  deleteAd
};
