import { toSatang, percentageSatang } from './money.js';

export function calculatePromotionDiscount(promotion, subtotal) {
    if (!Number.isFinite(subtotal) || subtotal < 0) {
        return { discount: 0, error: 'Invalid order subtotal.' };
    }
    if (!Number.isFinite(promotion.value) || promotion.value < 0) {
        return { discount: 0, error: 'This discount code has an invalid discount amount.' };
    }
    if (!Number.isFinite(promotion.maxDiscount) || promotion.maxDiscount < 0) {
        return { discount: 0, error: 'This discount code has an invalid maximum discount limit.' };
    }
    try {
    const subtotalSatang = toSatang(subtotal);
    let amount;
    if (promotion.type === 'fixed') {
        amount = toSatang(promotion.value);
    } else if (promotion.type === 'percentage' && promotion.value <= 100) {
        amount = percentageSatang(subtotalSatang, promotion.value);
    } else {
        return { discount: 0, error: 'This discount code has an unsupported discount configuration.' };
    }
    return { discount: Math.min(amount, toSatang(promotion.maxDiscount), subtotalSatang) / 100, error: '' };
    } catch {
        return { discount: 0, error: 'Discount amount exceeds supported monetary precision.' };
    }
}
