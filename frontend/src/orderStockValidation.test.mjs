import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrderStock } from './orderStockValidation.js';

const product = { id: 1, isActive: true, name: 'Shoe', price: 100, sizes: [7], colors: ['Black', 'White'], outOfStock: [] };
const catalog = [product];
const cart = ['Black', 'White'].map(color => ({ product, size: 7, color, quantity: 2 }));
const inventory = cart.map(item => ({ productId: 1, size: 7, color: item.color, stock: 2 }));

test('all lines at exact available stock pass', () => {
    assert.deepEqual(validateOrderStock(cart, catalog, inventory), { valid: true, errors: [] });
});

test('rechecks current inventory and catches a later line becoming unavailable', () => {
    const current = structuredClone(inventory);
    assert.equal(validateOrderStock(cart, catalog, current).valid, true);
    current[1].stock = 0;
    const result = validateOrderStock(cart, catalog, current);
    assert.equal(result.valid, false);
    assert.equal(result.errors[0].lineIndex, 1);
    assert.equal(result.errors[0].code, 'OUT_OF_STOCK');
    assert.match(result.errors[0].message, /Item 2/);
});

test('reports every failing line without changing cart or stock', () => {
    const records = inventory.map(item => ({ ...item, stock: 1 }));
    const before = structuredClone({ cart, records });
    const result = validateOrderStock(cart, catalog, records);
    assert.equal(result.errors.length, 2);
    assert.ok(result.errors.every(error => error.code === 'INSUFFICIENT_STOCK'));
    assert.deepEqual({ cart, records }, before);
});

test('rejects inactive, invalid, missing variations and empty carts', () => {
    assert.equal(validateOrderStock(cart, [{ ...product, isActive: false }], inventory).valid, false);
    assert.equal(validateOrderStock(cart, catalog, []).valid, false);
    assert.equal(validateOrderStock([{ ...cart[0], quantity: 0 }], catalog, inventory).valid, false);
    assert.equal(validateOrderStock([], catalog, inventory).valid, false);
    assert.equal(validateOrderStock([null], catalog, inventory).valid, false);
});
