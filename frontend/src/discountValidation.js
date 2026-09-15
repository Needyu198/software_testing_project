import { toSatang, formatMoney } from './money.js';
export function validateDiscountCodeInput(input) {
    if (input == null || input === '') {
        return { code: null, error: 'Please enter a discount code' };
    }
    if (typeof input !== 'string' || input.trim() === '') {
        return { code: null, error: 'Please enter a valid discount code' };
    }
    return { code: input.trim().toUpperCase(), error: '' };
}

// Discount input rule; general cart/money helpers still allow zero totals.
export function getDiscountAmountError(amount) {
    if (amount == null || (typeof amount === 'string' && amount.trim() === '')) return 'Purchase amount is required';
    if (!Number.isFinite(amount)) return 'Purchase amount must be a number';
    if (amount <= 0) return 'Purchase amount must be greater than zero';
    try {
        if (toSatang(amount) === 0) return 'Purchase amount must be greater than zero';
    } catch {
        return 'Purchase amount exceeds supported monetary precision';
    }
    return '';
}
export function getMinimumSpendError(promotion, subtotal) {
    if (!Number.isFinite(subtotal) || subtotal < 0) {
        return 'Invalid order subtotal. Please check your cart before applying a discount.';
    }
    if (!Number.isFinite(promotion.minSpend) || promotion.minSpend < 0) {
        return 'This discount code has an invalid minimum purchase amount.';
    }
    let belowMinimum;
    try { belowMinimum = toSatang(subtotal) < toSatang(promotion.minSpend); }
    catch { return 'Invalid minimum purchase amount or subtotal precision.'; }
    if (belowMinimum) {
        return `Minimum purchase of ฿${formatMoney(promotion.minSpend)} is required for this discount code.`;
    }
    return '';
}

// Accept a supplied clock for deterministic date-boundary tests.
export function getPromotionPeriodError(promotion, now = Date.now()) {
    const start = Date.parse(promotion.startsAt);
    const end = Date.parse(promotion.endsAt);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || !Number.isFinite(now)) {
        return 'This discount code has an invalid validity period.';
    }
    if (now < start) return 'This discount code is not yet valid.';
    if (now > end) return 'This discount code has expired.';
    return '';
}

export function isValidDiscountSubtotal(cart, subtotal) {
    if (!Number.isFinite(subtotal) || subtotal < 0) return false;

    return cart.every(item => {
        const price = item.product.salePrice ?? item.product.price;
        return Number.isFinite(price) && price >= 0
            && Number.isInteger(item.quantity) && item.quantity > 0
            && Number.isFinite(price * item.quantity);
    });
}
