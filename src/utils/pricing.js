const toMoney = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : 0;
};

const roundMoney = (value) => Number(toMoney(value).toFixed(2));

const getCommissionRate = (value) => {
    const rate = toMoney(value);

    if (rate < 0) {
        return 0;
    }

    return rate;
};

const addCommission = (baseAmount, commissionPercentage) => {
    const base = toMoney(baseAmount);
    const rate = getCommissionRate(commissionPercentage);
    const commissionAmount = roundMoney((base * rate) / 100);

    return {
        baseAmount: roundMoney(base),
        commissionPercentage: roundMoney(rate),
        commissionAmount,
        sellingAmount: roundMoney(base + commissionAmount)
    };
};

const calculateBookingPricing = ({
    unitBasePrice,
    units = 1,
    rooms = 1,
    commissionPercentage = 0
}) => {
    const quantity = Math.max(1, toMoney(units) * toMoney(rooms));
    const unit = addCommission(unitBasePrice, commissionPercentage);
    const totalBaseAmount = roundMoney(toMoney(unitBasePrice) * quantity);
    const total = addCommission(totalBaseAmount, commissionPercentage);

    return {
        unit_base_price: unit.baseAmount,
        unit_selling_price: unit.sellingAmount,
        booking_base_amount: total.baseAmount,
        booking_commission_percentage: total.commissionPercentage,
        booking_commission_amount: total.commissionAmount,
        total_amount: total.sellingAmount
    };
};

const deriveIncludedCommission = (sellingAmount, commissionPercentage) => {
    const selling = toMoney(sellingAmount);
    const rate = getCommissionRate(commissionPercentage);

    if (selling <= 0 || rate <= 0) {
        return {
            baseAmount: roundMoney(selling),
            commissionPercentage: roundMoney(rate),
            commissionAmount: 0,
            sellingAmount: roundMoney(selling)
        };
    }

    const baseAmount = roundMoney(selling / (1 + rate / 100));
    const commissionAmount = roundMoney(selling - baseAmount);

    return {
        baseAmount,
        commissionPercentage: roundMoney(rate),
        commissionAmount,
        sellingAmount: roundMoney(selling)
    };
};

module.exports = {
    toMoney,
    roundMoney,
    addCommission,
    calculateBookingPricing,
    deriveIncludedCommission
};
