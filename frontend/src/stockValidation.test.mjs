import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCatalogProduct, getCatalogStock, isValidProductColor } from './stockValidation.js';

const product = { id: 1, name: 'Test shoe', price: 1500, sizes: [7, 7.5], colors: ['Black'], outOfStock: [7] };
const catalog = [product];
const inventory = [
    { productId: 1, size: 7, color: 'Black', stock: 0 },
    { productId: 1, size: 7.5, color: 'Black', stock: 3 },
];

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
