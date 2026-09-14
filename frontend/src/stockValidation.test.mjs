import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCatalogProduct, getCatalogStock, isValidProductColor, validateStockRequest, getVariationStockStatus } from './stockValidation.js';

const product = { id: 1, name: 'Test shoe', price: 1500, sizes: [7, 7.5], colors: ['Black'], outOfStock: [7] };
const catalog = [product];
const inventory = [
    { productId: 1, size: 7, color: 'Black', stock: 0 },
    { productId: 1, size: 7.5, color: 'Black', stock: 3 },
];

const request = { product, size: 7.5, color: 'Black', requestedQuantity: 1 };

test('business maximum applies when variation stock exceeds 20', () => {
    const abundantInventory = [{ productId: 1, size: 7.5, color: 'Black', stock: 50 }];
    for (const requestedQuantity of [1, 19, 20]) {
        assert.equal(validateStockRequest({ ...request, requestedQuantity }, catalog, abundantInventory).valid, true);
    }
    for (const requestedQuantity of [21, 50, 51]) {
        const result = validateStockRequest({ ...request, requestedQuantity }, catalog, abundantInventory);
        assert.equal(result.valid, false);
        assert.equal(result.code, 'QUANTITY_LIMIT');
        assert.equal(result.availableStock, 50);
        assert.equal(result.message, 'Maximum quantity per size and colour is 20.');
    }
});

test('effective maximum uses stock when stock is below or equal to 20', () => {
    for (const stock of [1, 5, 19, 20]) {
        const records = [{ productId: 1, size: 7.5, color: 'Black', stock }];
        assert.equal(validateStockRequest({ ...request, requestedQuantity: stock }, catalog, records).valid, true);
        const result = validateStockRequest({ ...request, requestedQuantity: stock + 1 }, catalog, records);
        assert.equal(result.valid, false);
        assert.equal(result.code, 'INSUFFICIENT_STOCK');
    }
});

test('stock status distinguishes zero, low and normal inventory', () => {
    for (const stock of [1, 2, 3, 4, 8]) {
        assert.deepEqual(getVariationStockStatus(product, 7.5, 'Black', catalog,
            [{ productId: 1, size: 7.5, color: 'Black', stock }]),
        { status: stock <= 3 ? 'LOW_STOCK' : 'IN_STOCK', availableStock: stock, message: stock <= 3 ? `Low Stock — Only ${stock} left in stock` : `In Stock — ${stock} available` });
    }
    assert.deepEqual(getVariationStockStatus(product, 7, 'Black', catalog, inventory),
        { status: 'OUT_OF_STOCK', availableStock: 0, message: 'This size and colour combination is out of stock.' });
    assert.equal(getVariationStockStatus(product, 7.5, 'Red', catalog, inventory).status, 'INVALID_COLOR');
    assert.equal(getVariationStockStatus(product, 7.5, 'Black', catalog, []).status, 'VARIATION_UNAVAILABLE');
});

test('stock requests reject nonpositive, fractional, nonnumeric and unsafe quantities', () => {
    for (const requestedQuantity of [0, -1, 1.5, NaN, Infinity, -Infinity, '1', null, undefined, true, Number.MAX_SAFE_INTEGER + 1]) {
        const result = validateStockRequest({ ...request, requestedQuantity }, catalog, inventory);
        assert.equal(result.valid, false);
        assert.equal(result.code, 'INVALID_QUANTITY');
        assert.ok(result.message);
    }
});

test('stock request accepts minimum/exact stock and rejects one above stock', () => {
    for (const requestedQuantity of [1, 2, 3]) {
        assert.deepEqual(validateStockRequest({ ...request, requestedQuantity }, catalog, inventory),
            { valid: true, code: 'AVAILABLE', message: '', availableStock: 3 });
    }
    const result = validateStockRequest({ ...request, requestedQuantity: 4 }, catalog, inventory);
    assert.equal(result.code, 'INSUFFICIENT_STOCK');
    assert.equal(result.availableStock, 3);
    assert.equal(result.valid, false);
});

test('stock request rejects invalid selections and unavailable stock without changing inventory', () => {
    const before = structuredClone(inventory);
    for (const [override, code] of [
        [{ product: null }, 'INVALID_PRODUCT'],
        [{ size: 99 }, 'INVALID_SIZE'],
        [{ color: 'Red' }, 'INVALID_COLOR'],
        [{ size: 7 }, 'OUT_OF_STOCK'],
    ]) {
        assert.equal(validateStockRequest({ ...request, ...override }, catalog, inventory).code, code);
    }
    assert.deepEqual(inventory, before);
});

test('stock lookup distinguishes colour, size and product, and rejects missing variations', () => {
    const shoe = { ...product, colors: ['Black', 'White'] };
    const records = [...inventory,
        { productId: 1, size: 7.5, color: 'White', stock: 8 },
        { productId: 2, size: 7.5, color: 'Black', stock: 99 }];
    assert.equal(getCatalogStock(shoe, 7.5, [shoe], 'Black', records), 3);
    assert.equal(getCatalogStock(shoe, 7.5, [shoe], 'White', records), 8);
    assert.equal(getCatalogStock(shoe, 7, [shoe], 'Black', records), 0);
    assert.equal(getCatalogStock(shoe, 7, [shoe], 'White', records), 0);
    assert.equal(getCatalogStock(shoe, 7.5, [shoe], 'Red', records), 0);
    for (const stock of [-1, NaN, Infinity, 1.5, '8']) {
        assert.equal(getCatalogStock(shoe, 7.5, [shoe], 'White', [{ productId: 1, size: 7.5, color: 'White', stock }]), 0);
    }
});

test('colour validation requires exact membership in the catalog product', () => {
    assert.equal(isValidProductColor(product, 'Black', catalog), true);
    for (const color of [undefined, null, '', ' ', 'Red', 'black', ' Black ', 1, ['Black']]) {
        assert.equal(isValidProductColor(product, color, catalog), false);
    }
    assert.equal(isValidProductColor({ ...product, colors: ['Red'] }, 'Red', catalog), false);
    assert.equal(isValidProductColor({ ...product, id: 999 }, 'Black', catalog), false);
    assert.equal(isValidProductColor(null, 'Black', catalog), false);
});

test('resolves known IDs and preserves size stock checks', () => {
    assert.equal(resolveCatalogProduct({ ...product }, catalog), product);
    assert.equal(getCatalogStock(product, 7.5, catalog, 'Black', inventory), 3);
    assert.equal(getCatalogStock(product, 7, catalog, 'Black', inventory), 0);
    assert.equal(getCatalogStock(product, 99, catalog, 'Black', inventory), 0);
});

test('rejects unknown and invalid product IDs', () => {
    for (const id of [999, 0, -1, 1.5, '1', NaN, Infinity, undefined]) {
        const input = { ...product, id };
        assert.equal(resolveCatalogProduct(input, catalog), null);
        assert.equal(getCatalogStock(input, 7.5, catalog, 'Black', inventory), 0);
    }
});

test('malformed inputs do not throw or yield stock', () => {
    for (const input of [null, undefined, [], 'shoe', 1, {}, { id: 1 },
        { ...product, sizes: null }, { ...product, outOfStock: undefined },
        { ...product, colors: [] }, { ...product, price: NaN }]) {
        assert.equal(resolveCatalogProduct(input, catalog), null);
        assert.equal(getCatalogStock(input, 7.5, catalog, 'Black', inventory), 0);
    }
});

test('uses catalog values rather than supplied prices or stock data', () => {
    const altered = { ...product, price: 1, sizes: [7, 7.5, 99], outOfStock: [] };
    assert.equal(resolveCatalogProduct(altered, catalog).price, 1500);
    assert.equal(getCatalogStock(altered, 7, catalog, 'Black', inventory), 0);
    assert.equal(getCatalogStock(altered, 99, catalog, 'Black', inventory), 0);
});


test('low-stock threshold is configurable, including zero', () => {
    assert.equal(getVariationStockStatus(product, 7.5, 'Black', catalog, inventory, 2).status, 'IN_STOCK');
    assert.equal(getVariationStockStatus(product, 7.5, 'Black', catalog, inventory, 3).status, 'LOW_STOCK');
    assert.equal(getVariationStockStatus(product, 7.5, 'Black', catalog, inventory, 5).status, 'LOW_STOCK');
    assert.equal(getVariationStockStatus(product, 7.5, 'Black', catalog, inventory, 0).status, 'IN_STOCK');
    assert.equal(getVariationStockStatus(product, 7, 'Black', catalog, inventory, 5).status, 'OUT_OF_STOCK');
    for (const threshold of [-1, 1.5, NaN, Infinity, '3']) {
        assert.throws(() => getVariationStockStatus(product, 7.5, 'Black', catalog, inventory, threshold), RangeError);
    }
});


test('availability returns distinct messages that request validation reuses', () => {
    const cases = [
        [{ product: null }, inventory, 'INVALID_PRODUCT'],
        [{ size: null }, inventory, 'SELECT_SIZE'],
        [{ size: 99 }, inventory, 'INVALID_SIZE'],
        [{ color: 'Red' }, inventory, 'INVALID_COLOR'],
        [{}, [], 'VARIATION_UNAVAILABLE'],
        [{}, [{ productId: 1, size: 7.5, color: 'Black', stock: -1 }], 'INVALID_STOCK'],
        [{ size: 7 }, inventory, 'OUT_OF_STOCK'],
    ];
    const messages = new Set();
    for (const [override, records, expected] of cases) {
        const input = { ...request, ...override };
        const status = getVariationStockStatus(input.product, input.size, input.color, catalog, records);
        assert.equal(status.status, expected);
        assert.ok(status.message);
        messages.add(status.message);
        const validation = validateStockRequest(input, catalog, records);
        assert.equal(validation.valid, false);
        assert.equal(validation.message, status.message);
    }
    assert.equal(messages.size, cases.length);
});
