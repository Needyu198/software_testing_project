import { validateQuantity } from './quantityValidation.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { addCartItem, updateCartQuantity } from './cartOperations.js';

const product = { id: 1, isActive: true, name: 'Test shoe', price: 100, sizes: [7], colors: ['Black', 'White'], outOfStock: [] };
const catalog = [product];
const inventory = [
    { productId: 1, size: 7, color: 'Black', stock: 3 },
    { productId: 1, size: 7, color: 'White', stock: 1 },
];
const add = (cart, color = 'Black') => addCartItem(cart, product, 7, color, catalog, inventory);

test('inactive products cannot be added or increased and cart stays unchanged', () => {
    const inactiveCatalog = [{ ...product, isActive: false }];
    const empty = [];
    const result = addCartItem(empty, product, 7, 'Black', inactiveCatalog, inventory);
    assert.equal(result.cart, empty);
    assert.equal(result.type, 'error');
    assert.equal(result.message, 'This product is not available for purchase.');
    const existing = [{ product, size: 7, color: 'Black', quantity: 1 }];
    const update = updateCartQuantity(existing, { productId: 1, size: 7, color: 'Black' }, 'increase', inactiveCatalog, inventory);
    assert.equal(update.cart, existing);
    assert.equal(update.code, 'INACTIVE_PRODUCT');
});

test('requested quantity creates a new line and merges with an existing line', () => {
    const first = addCartItem([], product, 7, 'Black', catalog, inventory, 2);
    assert.equal(first.cart[0].quantity, 2);
    const second = addCartItem(first.cart, product, 7, 'Black', catalog, inventory, 1);
    assert.equal(second.cart.length, 1);
    assert.equal(second.cart[0].quantity, 3);
    assert.equal(add([]).cart[0].quantity, 1);
});

test('bulk additions validate resulting quantity against stock and business maximum', () => {
    const cart = [{ product, size: 7, color: 'Black', quantity: 2 }];
    assert.equal(addCartItem(cart, product, 7, 'Black', catalog, inventory, 2).cart, cart);
    const abundant = [{ productId: 1, size: 7, color: 'Black', stock: 50 }];
    const accepted = addCartItem(cart, product, 7, 'Black', catalog, abundant, 18);
    assert.equal(accepted.cart[0].quantity, 20);
    assert.equal(addCartItem(cart, product, 7, 'Black', catalog, abundant, 19).cart, cart);
    assert.equal(addCartItem([], product, 7, 'Black', catalog, abundant, 21).type, 'error');
});

test('invalid requested quantities cannot be hidden by an existing positive quantity', () => {
    const cart = [{ product, size: 7, color: 'Black', quantity: 2 }];
    for (const qty of [0, -1, 1.5, '2', null, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
        const result = addCartItem(cart, product, 7, 'Black', catalog, inventory, qty);
        assert.equal(result.cart, cart);
        assert.equal(result.type, 'error');
        assert.equal(result.message, validateQuantity(qty).message);
    }
});

test('queued additions with stock 50 stop at business maximum 20', () => {
    const records = [{ productId: 1, size: 7, color: 'Black', stock: 50 }];
    let cart = [{ product, size: 7, color: 'Black', quantity: 19 }];
    const first = addCartItem(cart, product, 7, 'Black', catalog, records);
    assert.equal(first.type, 'success');
    cart = first.cart;
    assert.equal(cart[0].quantity, 20);
    for (let i = 0; i < 5; i++) {
        const result = addCartItem(cart, product, 7, 'Black', catalog, records);
        assert.equal(result.cart, cart);
        assert.equal(result.type, 'error');
    }
    assert.equal(records[0].stock, 50);
});

test('queued additions use the previous transition result and stop at stock', () => {
    let cart = [{ product, size: 7, color: 'Black', quantity: 2 }];
    const queued = Array.from({ length: 5 }, () => previous => add(previous));
    const outcomes = queued.map(update => {
        const result = update(cart);
        cart = result.cart;
        return result.type;
    });
    assert.equal(cart[0].quantity, 3);
    assert.deepEqual(outcomes, ['success', 'error', 'error', 'error', 'error']);
});

test('queued new-line additions merge into one line without exceeding stock', () => {
    let cart = [];
    for (let i = 0; i < 5; i++) cart = add(cart).cart;
    assert.equal(cart.length, 1);
    assert.equal(cart[0].quantity, 3);
});

test('transition is replayable and does not mutate prior cart or inventory', () => {
    const cart = [{ product, size: 7, color: 'Black', quantity: 2 }];
    const before = structuredClone({ cart, inventory });
    assert.deepEqual(add(cart), add(cart));
    assert.deepEqual({ cart, inventory }, before);
    const full = add(cart).cart;
    const rejected = add(full);
    assert.equal(rejected.cart, full);
    assert.equal(rejected.message, 'Maximum available quantity is 3.');
});

test('each colour has its own stock limit and rejected variations leave cart intact', () => {
    const cart = add([]).cart;
    const white = add(cart, 'White').cart;
    assert.equal(white.length, 2);
    assert.equal(add(white, 'White').cart, white);
    assert.equal(add(white, 'Red').cart, white);
    assert.equal(addCartItem(white, null, 7, 'Black', catalog, inventory).cart, white);
});


const selection = { productId: 1, size: 7, color: 'Black' };

test('stock falling to zero removes the line on either quantity action', () => {
    const changedInventory = inventory.map(entry => ({ ...entry, stock: entry.color === 'Black' ? 0 : entry.stock }));
    for (const action of ['increase', 'decrease']) {
        for (const quantity of [1, 3]) {
            const cart = [
                { product, size: 7, color: 'Black', quantity },
                { product, size: 7, color: 'White', quantity: 1 },
            ];
            const result = updateCartQuantity(cart, selection, action, catalog, changedInventory);
            assert.equal(result.code, 'REMOVED_OUT_OF_STOCK');
            assert.equal(result.quantity, 0);
            assert.match(result.message, /out of stock.*removed/);
            assert.deepEqual(result.cart, [cart[1]]);
            assert.equal(cart.length, 2);
            assert.equal(changedInventory[0].stock, 0);
        }
    }
});

test('invalid actions still reject without removing a zero-stock line', () => {
    const cart = add([]).cart;
    const records = [{ ...selection, stock: 0 }];
    const result = updateCartQuantity(cart, selection, 'invalid', catalog, records);
    assert.equal(result.code, 'ERROR_INVALID_ACTION');
    assert.equal(result.cart, cart);
});
test('unexpected actions return ERROR_INVALID_ACTION and preserve cart', () => {
    const cart = add([]).cart;
    for (const action of ['remove', '', null, undefined, 2, 'Increase', {}]) {
        const result = updateCartQuantity(cart, selection, action, catalog, inventory);
        assert.equal(result.code, 'ERROR_INVALID_ACTION');
        assert.equal(result.cart, cart);
        assert.equal(result.type, 'error');
    }
});

test('actions increment, decrement and remove at one', () => {
    const initial = add([]).cart;
    const increased = updateCartQuantity(initial, selection, 'increase', catalog, inventory);
    assert.equal(increased.quantity, 2);
    const decreased = updateCartQuantity(increased.cart, selection, 'decrease', catalog, inventory);
    assert.equal(decreased.quantity, 1);
    const removed = updateCartQuantity(decreased.cart, selection, 'decrease', catalog, inventory);
    assert.equal(removed.quantity, 0);
    assert.equal(removed.cart.length, 0);
    assert.equal(initial[0].quantity, 1);
});

test('queued increases reach but cannot exceed effective maximum', () => {
    for (const stock of [3, 50]) {
        const records = [{ ...selection, stock }];
        let cart = add([]).cart;
        for (let i = 0; i < 25; i++) cart = updateCartQuantity(cart, selection, 'increase', catalog, records).cart;
        assert.equal(cart[0].quantity, Math.min(20, stock));
        assert.equal(updateCartQuantity(cart, selection, 'increase', catalog, records).type, 'error');
    }
});

test('queued actions on a removed line do not modify a different variation', () => {
    const cart = add(add([]).cart, 'White').cart;
    const removed = updateCartQuantity(cart, selection, 'decrease', catalog, inventory).cart;
    const result = updateCartQuantity(removed, selection, 'increase', catalog, inventory);
    assert.equal(result.code, 'ERROR_INVALID_ITEM');
    assert.equal(result.cart, removed);
    assert.equal(result.cart[0].color, 'White');
    assert.equal(result.cart[0].quantity, 1);
});
