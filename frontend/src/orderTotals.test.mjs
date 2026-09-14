import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOrderTotals } from './orderTotals.js';
import { promotions } from './promotions.js';

const now = Date.parse('2026-09-14T12:00:00+07:00');
const cart = (price, quantity = 1) => [{ product: { price }, quantity }];
const totals = (items, promotion = null, delivery = 'standard') => calculateOrderTotals(items, promotion, delivery, now);

test('shared totals include percentage and fixed discounts and express shipping', () => {
    const welcome = totals(cart(4590), promotions[0]);
    assert.deepEqual(welcome, { subtotal: 4590, discount: 459, shipping: 0, total: 4131, promoCode: 'WELCOME10', error: '' });
    const fixed = totals(cart(4590), promotions.find(p => p.code === 'SAVE500'), 'express');
    assert.equal(fixed.discount, 500);
    assert.equal(fixed.shipping, 150);
    assert.equal(fixed.total, 4240);
});

test('standard shipping uses pre-discount subtotal threshold consistently', () => {
    assert.equal(totals(cart(2499)).shipping, 150);
    assert.equal(totals(cart(2500)).shipping, 0);
    assert.equal(totals(cart(2501)).shipping, 0);
    assert.equal(totals(cart(2500), promotions[0]).shipping, 0);
    assert.equal(totals([]).total, 0);
});

test('quantity, sale prices and promotion removal recalculate totals', () => {
    const items = [{ product: { price: 3000, salePrice: 2000 }, quantity: 2 }];
    assert.equal(totals(items, promotions[0]).total, 3600);
    assert.equal(totals(items).total, 4000);
    assert.equal(totals([{ ...items[0], quantity: 1 }], promotions[0]).total, 1950);
});

test('invalid promotion or subtotal cannot silently yield a discounted order', () => {
    for (const promotion of [{ ...promotions[0], status: 'Inactive' }, promotions[1]]) {
        const result = totals(cart(4000), promotion);
        assert.ok(result.error);
        assert.equal(result.discount, 0);
    }
    assert.ok(totals(cart(1000), promotions[0]).error);
    assert.ok(totals(cart(-1)).error);
});

test('saved totals stay unchanged after the live cart is edited', () => {
    const items = cart(4590);
    const snapshot = { items: structuredClone(items), totals: { ...totals(items, promotions[0]) } };
    items[0].quantity = 2;
    assert.equal(snapshot.items[0].quantity, 1);
    assert.equal(snapshot.totals.total, 4131);
    assert.notEqual(totals(items, promotions[0]).total, snapshot.totals.total);
});
