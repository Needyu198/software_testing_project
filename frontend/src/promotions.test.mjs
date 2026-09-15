import test from 'node:test';
import assert from 'node:assert/strict';
import { redeemDemoPromotion } from './promotions.js';

test('last available redemption succeeds and the next session is rejected', () => {
    const promotion = { redemptionCount: 499, redemptionLimit: 500 };
    const session = {};
    assert.equal(redeemDemoPromotion(promotion, session), '');
    assert.equal(promotion.redemptionCount, 500);
    assert.equal(redeemDemoPromotion(promotion, {}), 'This discount code has reached its redemption limit.');
    assert.equal(promotion.redemptionCount, 500);
    assert.equal(redeemDemoPromotion(promotion, session), '');
    assert.equal(promotion.redemptionCount, 500);
});

test('zero limits and counts already above limit reject without mutation', () => {
    for (const count of [0, 1]) {
        const promotion = { redemptionCount: count, redemptionLimit: 0 };
        assert.notEqual(redeemDemoPromotion(promotion, {}), '');
        assert.equal(promotion.redemptionCount, count);
    }
});

test('invalid counts and limits reject without mutation', () => {
    for (const value of [-1, 0.5, NaN, Infinity, '500', '', false]) {
        for (const field of ['redemptionCount', 'redemptionLimit']) {
            const promotion = { redemptionCount: 0, redemptionLimit: 500, [field]: value };
            const before = { ...promotion };
            assert.equal(redeemDemoPromotion(promotion, {}), 'This discount code has invalid redemption limits.');
            assert.deepEqual(promotion, before);
        }
    }
});

test('null and omitted limits allow redemptions while counting once per session', () => {
    for (const promotion of [{ redemptionCount: 150, redemptionLimit: null }, { redemptionCount: 150 }]) {
        const session = {};
        assert.equal(redeemDemoPromotion(promotion, session), '');
        assert.equal(promotion.redemptionCount, 151);
        assert.equal(redeemDemoPromotion(promotion, session), '');
        assert.equal(promotion.redemptionCount, 151);
        assert.equal(redeemDemoPromotion(promotion, {}), '');
        assert.equal(promotion.redemptionCount, 152);
    }
});

test('unlimited usage still rejects missing counts and prevents numeric overflow', () => {
    assert.equal(redeemDemoPromotion({ redemptionLimit: null }, {}), 'This discount code has invalid redemption limits.');
    const promotion = { redemptionCount: Number.MAX_SAFE_INTEGER, redemptionLimit: null };
    assert.match(redeemDemoPromotion(promotion, {}), /precision/);
    assert.equal(promotion.redemptionCount, Number.MAX_SAFE_INTEGER);
});

test('repeated application in one session counts once per promotion', () => {
    const session = {};
    const first = { redemptionCount: 124, redemptionLimit: 500 };
    const second = { redemptionCount: 0, redemptionLimit: 10 };
    for (let i = 0; i < 3; i++) assert.equal(redeemDemoPromotion(first, session), '');
    assert.equal(first.redemptionCount, 125);
    assert.equal(redeemDemoPromotion(second, session), '');
    assert.equal(second.redemptionCount, 1);
});
