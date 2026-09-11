export function getMinimumSpendError(promotion, subtotal) {
    if (!Number.isFinite(subtotal) || subtotal < 0) {
        return 'Invalid order subtotal. Please check your cart before applying a discount.';
    }
    if (!Number.isFinite(promotion.minSpend) || promotion.minSpend < 0) {
        return 'This discount code has an invalid minimum purchase amount.';
    }
    if (subtotal < promotion.minSpend) {
        return `Minimum purchase of ฿${promotion.minSpend.toLocaleString('en-US')} is required for this discount code.`;
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
