import test from 'node:test';
import assert from 'node:assert/strict';
import { getDiscountAmountError } from './discountValidation.js';
import { calculateOrderTotals } from './orderTotals.js';
import { promotions } from './promotions.js';

test('discount purchase amount rejects zero and negatives explicitly', () => {
    for (const amount of [0, -0, -1, 0.004]) assert.equal(getDiscountAmountError(amount), 'Purchase amount must be greater than zero');
    for (const amount of [0.01, 1, 1500]) assert.equal(getDiscountAmountError(amount), '');
});

test('discount amount rejects missing and nonnumeric inputs', () => {
    for (const amount of [null, undefined, '', ' ']) assert.equal(getDiscountAmountError(amount), 'Purchase amount is required');
    for (const amount of [NaN, Infinity, '100']) assert.equal(getDiscountAmountError(amount), 'Purchase amount must be a number');
});

test('zero cart total stays valid without a promotion; zero-minimum promo cannot bypass rule', () => {
    const empty = calculateOrderTotals([]);
    assert.equal(empty.total, 0);
    assert.equal(empty.error, '');
    const promotion = { ...promotions[0], minSpend: 0 };
    for (const cart of [[], [{ product: { price: 0 }, quantity: 1 }]]) {
        const result = calculateOrderTotals(cart, promotion, 'standard', Date.parse('2026-09-15'));
        assert.equal(result.error, 'Purchase amount must be greater than zero');
        assert.equal(result.discount, 0);
        assert.equal(result.promoCode, null);
    }
});
