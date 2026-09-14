import test from 'node:test';
import assert from 'node:assert/strict';
import { getPromotionPeriodError, getMinimumSpendError } from './discountValidation.js';
import { promotions } from './promotions.js';

const promotion = promotions[0];
const start = Date.parse(promotion.startsAt);
const end = Date.parse(promotion.endsAt);

test('minimum spend rejects below threshold and accepts exact or higher subtotal', () => {
    assert.equal(getMinimumSpendError(promotion, 1499.99), 'Minimum purchase of ฿1,500.00 is required for this discount code.');
    assert.equal(getMinimumSpendError(promotion, 1500), '');
    assert.equal(getMinimumSpendError(promotion, 1500.01), '');
    assert.equal(getMinimumSpendError(promotion, 0).length > 0, true);
    assert.equal(getMinimumSpendError({ minSpend: 0 }, 0), '');
});

test('minimum spend rejects invalid numeric inputs and configuration', () => {
    for (const value of [NaN, Infinity, -1, '1500', undefined]) {
        assert.notEqual(getMinimumSpendError(promotion, value), '');
        assert.notEqual(getMinimumSpendError({ minSpend: value }, 1500), '');
    }
});

test('uses each promotion minimum and rechecks changed subtotals', () => {
    for (const entry of promotions) {
        assert.equal(getMinimumSpendError(entry, entry.minSpend), '');
        assert.notEqual(getMinimumSpendError(entry, entry.minSpend - 1), '');
        assert.equal(getMinimumSpendError(entry, entry.minSpend + 1), '');
    }
});

test('promotion period includes its exact start and end', () => {
    assert.equal(getPromotionPeriodError(promotion, start), '');
    assert.equal(getPromotionPeriodError(promotion, end), '');
    assert.equal(getPromotionPeriodError(promotion, (start + end) / 2), '');
});

test('rejects one millisecond outside either boundary', () => {
    assert.equal(getPromotionPeriodError(promotion, start - 1), 'This discount code is not yet valid.');
    assert.equal(getPromotionPeriodError(promotion, end + 1), 'This discount code has expired.');
});

test('expiry follows Bangkok time, including the final day', () => {
    assert.equal(getPromotionPeriodError(promotion, Date.parse('2026-12-31T16:59:59.999Z')), '');
    assert.equal(getPromotionPeriodError(promotion, Date.parse('2026-12-31T17:00:00Z')), 'This discount code has expired.');
});

test('rejects missing, invalid and reversed periods or invalid clock values', () => {
    for (const invalid of [{}, { ...promotion, startsAt: 'invalid' }, { ...promotion, endsAt: undefined },
        { startsAt: promotion.endsAt, endsAt: promotion.startsAt }]) {
        assert.equal(getPromotionPeriodError(invalid, start), 'This discount code has an invalid validity period.');
    }
    assert.equal(getPromotionPeriodError(promotion, NaN), 'This discount code has an invalid validity period.');
});

test('configured summer promotion is expired in September', () => {
    assert.equal(getPromotionPeriodError(promotions[1], Date.parse('2026-09-10T12:00:00+07:00')), 'This discount code has expired.');
});
