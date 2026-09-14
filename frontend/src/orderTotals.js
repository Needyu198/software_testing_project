import { toSatang, lineTotalSatang } from './money.js';
import { isValidDiscountSubtotal, getMinimumSpendError, getPromotionPeriodError } from './discountValidation.js';
import { calculatePromotionDiscount } from './discountCalculation.js';

export function calculateOrderTotals(cart, promotion = null, delivery = 'standard', now = Date.now()) {
    let subtotalSatang;
    try {
        subtotalSatang = cart.reduce((sum, item) => sum + lineTotalSatang(item), 0);
        if (!Number.isSafeInteger(subtotalSatang)) throw new RangeError();
    } catch {
        return { subtotal: 0, discount: 0, shipping: 0, total: 0, promoCode: null, error: 'Invalid order subtotal or unsupported monetary precision.' };
    }
    const subtotal = subtotalSatang / 100;
    if (!isValidDiscountSubtotal(cart, subtotal)) {
        return { subtotal: 0, discount: 0, shipping: 0, total: 0, promoCode: null, error: 'Invalid order subtotal.' };
    }
    let discount = 0;
    let error = '';
    if (promotion) {
        error = promotion.status !== 'Active' ? 'This discount code is inactive.'
            : getPromotionPeriodError(promotion, now) || getMinimumSpendError(promotion, subtotal);
        if (!error) {
            const calculation = calculatePromotionDiscount(promotion, subtotal);
            error = calculation.error;
            discount = calculation.discount;
        }
    }
    const shipping = cart.length === 0 ? 0 : delivery === 'express' ? 150 : subtotal >= 2500 ? 0 : 150;
    return { subtotal, discount, shipping, total: (subtotalSatang - toSatang(discount) + toSatang(shipping)) / 100,
        promoCode: promotion && !error ? promotion.code : null, error };
}
