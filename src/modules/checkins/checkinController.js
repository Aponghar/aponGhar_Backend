const checkinService = require("./checkinService");

const {
  checkinSchema,
  ownerCheckinSchema,
} = require("./checkinValidation");

const initiateCheckIn = async (req, res, next) => {
  try {
    const { error } = checkinSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    await checkinService.initiateCheckIn(
      req.user.id,
      req.body.booking_id
    );
  } catch (error) {
    if (error.message === "User-initiated check-in has been disabled") {
      return res.status(410).json({
        success: false,
        message:
          "User check-in is no longer required. Please share your booking code with the property owner.",
      });
    }

    next(error);
  }
};

const getOwnerBookingForCheckIn = async (req, res, next) => {
  try {
    const booking = await checkinService.getOwnerBookingForCheckIn(
      req.user.id,
      req.params.bookingCode
    );

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const ownerCheckIn = async (req, res, next) => {
  try {
    const { error, value } = ownerCheckinSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await checkinService.ownerCheckIn(
      req.user.id,
      value.booking_code,
      value.assigned_room_id
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOwnerCheckInHistory = async (req, res, next) => {
  try {
    const checkIns = await checkinService.getOwnerCheckInHistory(
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: checkIns,
    });
  } catch (error) {
    next(error);
  }
};

const getPropertyCheckIns = async (req, res, next) => {
  try {
    const checkIns = await checkinService.getPropertyCheckIns(
      req.user.id,
      req.params.propertyId
    );

    res.status(200).json({
      success: true,
      data: checkIns,
    });
  } catch (error) {
    next(error);
  }
};

const confirmCheckIn = async (req, res, next) => {
  try {
    const { checkinId } = req.params;

    const result = await checkinService.confirmCheckIn(
      checkinId,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const recordCheckIn = async (req, res, next) => {
  try {
    const { checkinId } = req.params;

    const result = await checkinService.recordCheckIn(checkinId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getPendingCheckIns = async (req, res, next) => {
  try {
    const checkIns = await checkinService.getPendingCheckInsOwner(
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: checkIns,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminCheckIns = async (req, res, next) => {
  try {
    const checkIns = await checkinService.getPendingCheckInsAdmin();

    res.status(200).json({
      success: true,
      data: checkIns,
    });
  } catch (error) {
    next(error);
  }
};

const getPendingCommissions = async (req, res, next) => {
  try {
    const commissions =
      await checkinService.getCommissionsForAdmin({
        status: "PENDING",
        propertyId: req.query.property_id,
        requestState: req.query.request_state,
      });

    res.status(200).json({
      success: true,
      data: commissions,
    });
  } catch (error) {
    next(error);
  }
};

const getCommissionSummary = async (req, res, next) => {
  try {
    const summary = await checkinService.getCommissionSummaryData({
      propertyId: req.query.property_id,
      status: req.query.status,
      requestState: req.query.request_state,
    });

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

const getOwnerCommissions = async (req, res, next) => {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to,
      status: req.query.status,
    };
    const commissions = await checkinService.getOwnerCommissions(
      req.user.id,
      filters
    );

    res.status(200).json({
      success: true,
      data: commissions,
    });
  } catch (error) {
    next(error);
  }
};

const getOwnerCommissionSummary = async (req, res, next) => {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to,
    };
    const summary = await checkinService.getOwnerCommissionSummary(
      req.user.id,
      filters
    );

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

const payCommission = async (req, res, next) => {
  try {
    const result = await checkinService.payCommission(
      req.user.id,
      req.params.commissionId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const ownerCheckOut = async (req, res, next) => {
  try {
    const result = await checkinService.ownerCheckOut(
      req.user.id,
      req.params.checkinId
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiateCheckIn,
  getOwnerBookingForCheckIn,
  ownerCheckIn,
  getOwnerCheckInHistory,
  getPropertyCheckIns,
  confirmCheckIn,
  recordCheckIn,
  getPendingCheckIns,
  getAdminCheckIns,
  getPendingCommissions,
  getCommissionSummary,
  getOwnerCommissions,
  getOwnerCommissionSummary,
  payCommission,
  ownerCheckOut,
};
