import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePromotionDiscount } from './discountCalculation.js';
import { promotions } from './promotions.js';

test('SAVE500 subtracts a fixed amount regardless of qualifying subtotal', () => {
    const promotion = promotions.find(p => p.code === 'SAVE500');
    for (const subtotal of [1500, 2500, 5000]) {
        assert.deepEqual(calculatePromotionDiscount(promotion, subtotal), { discount: 500, error: '' });
    }
});

test('fixed discount cannot exceed subtotal, including zero', () => {
    for (const subtotal of [0, 100, 500]) {
        assert.equal(calculatePromotionDiscount({ type: 'fixed', value: 500, maxDiscount: 500 }, subtotal).discount, subtotal);
    }
});

test('WELCOME10 preserves ordinary discounts and caps larger ones', () => {
    assert.equal(calculatePromotionDiscount(promotions[0], 5000).discount, 500);
    assert.equal(calculatePromotionDiscount(promotions[0], 21160).discount, 1000);
});

test('invalid amounts and unsupported types are rejected', () => {
    for (const value of [-1, NaN, Infinity, '500']) {
        assert.ok(calculatePromotionDiscount({ type: 'fixed', value, maxDiscount: 500 }, 2000).error);
    }
    assert.ok(calculatePromotionDiscount({ type: 'other', value: 500, maxDiscount: 500 }, 2000).error);
    assert.ok(calculatePromotionDiscount({ type: 'percentage', value: 101, maxDiscount: 1000 }, 2000).error);
    assert.ok(calculatePromotionDiscount({ type: 'fixed', value: 500, maxDiscount: 500 }, -1).error);
});


test('percentage discount below, at and above the cap', () => {
    const promotion = { type: 'percentage', value: 10, maxDiscount: 1000 };
    for (const [subtotal, expected] of [[9990, 999], [10000, 1000], [10010, 1000]]) {
        assert.deepEqual(calculatePromotionDiscount(promotion, subtotal), { discount: expected, error: '' });
    }
});

test('fixed discounts respect cap, zero cap and subtotal', () => {
    for (const [maxDiscount, subtotal, expected] of [[300, 2000, 300], [500, 2000, 500], [600, 2000, 500], [0, 2000, 0], [300, 100, 100]]) {
        assert.deepEqual(calculatePromotionDiscount({ type: 'fixed', value: 500, maxDiscount }, subtotal), { discount: expected, error: '' });
    }
});

test('invalid or missing caps return an error and no discount', () => {
    for (const maxDiscount of [undefined, null, -1, NaN, Infinity, '1000']) {
        assert.deepEqual(calculatePromotionDiscount({ type: 'fixed', value: 500, maxDiscount }, 2000),
            { discount: 0, error: 'This discount code has an invalid maximum discount limit.' });
    }
});
