import test from 'node:test';
import assert from 'node:assert/strict';
import { toSatang, formatMoney, lineTotalSatang } from './money.js';
import { calculatePromotionDiscount } from './discountCalculation.js';
import { calculateOrderTotals } from './orderTotals.js';

const promotion = { code: 'TEST', type: 'percentage', value: 10, maxDiscount: 1000, minSpend: 0, status: 'Active', startsAt: '2026-01-01T00:00:00Z', endsAt: '2026-12-31T23:59:59Z' };

test('half-up precision handles decimal boundaries without binary rounding errors', () => {
    for (const [input, expected] of [[1.004, 100], [1.005, 101], [1.006, 101], [2.675, 268], [0.005, 1], [1e-7, 0]]) {
        assert.equal(toSatang(input), expected);
    }
    assert.equal(formatMoney(1500), '1,500.00');
    assert.equal(formatMoney(1.005), '1.01');
});

test('unit prices round before quantity multiplication and summation', () => {
    assert.equal(lineTotalSatang({ product: { price: 1.005 }, quantity: 3 }), 303);
    const result = calculateOrderTotals([{ product: { price: 0.1 }, quantity: 1 }, { product: { price: 0.2 }, quantity: 1 }]);
    assert.equal(result.subtotal, 0.3);
    assert.equal(result.total, 150.3);
});

test('percentage discounts round once to satang, including half-satang ties', () => {
    assert.equal(calculatePromotionDiscount(promotion, 100.05).discount, 10.01);
    assert.equal(calculatePromotionDiscount(promotion, 100.04).discount, 10);
    assert.equal(calculatePromotionDiscount({ ...promotion, type: 'fixed', value: 1.005 }, 100).discount, 1.01);
    assert.equal(calculatePromotionDiscount({ ...promotion, maxDiscount: 1.005 }, 100).discount, 1.01);
});

test('fractional order totals remain consistent with displayed components', () => {
    const result = calculateOrderTotals([{ product: { price: 100.05 }, quantity: 1 }], promotion, 'standard', Date.parse('2026-09-14'));
    assert.equal(result.subtotal, 100.05);
    assert.equal(result.discount, 10.01);
    assert.equal(result.total, 240.04);
    assert.equal(formatMoney(result.total), '240.04');
});

test('invalid and unsafe amounts cannot silently lose precision', () => {
    for (const value of [-1, NaN, Infinity, '1.00', Number.MAX_VALUE]) assert.throws(() => toSatang(value), RangeError);
    assert.ok(calculateOrderTotals([{ product: { price: Number.MAX_SAFE_INTEGER }, quantity: 1 }]).error);
});
