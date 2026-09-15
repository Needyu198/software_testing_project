import test from 'node:test';
import assert from 'node:assert/strict';
import { runReadOnlyInventoryCheck } from './inventoryIntegrity.js';
import { validateStockRequest } from './stockValidation.js';

const product = { id: 1, isActive: true, name: 'Shoe', price: 100, sizes: [7], colors: ['Black'], outOfStock: [] };
const request = { product, size: 7, color: 'Black', requestedQuantity: 1 };

test('success, rejection and stock/business boundaries preserve every inventory record', () => {
    for (const stock of [0, 1, 3, 20, 50]) {
        const inventory = [
            { productId: 1, size: 7, color: 'Black', stock },
            { productId: 2, size: 8, color: 'White', stock: 9 },
        ];
        const before = structuredClone(inventory);
        for (const requestedQuantity of [undefined, 0, -1, 1.5, 1, 3, 19, 20, 21, 51]) {
            const result = validateStockRequest({ ...request, requestedQuantity }, [product], inventory);
            assert.equal(result.valid, Number.isInteger(requestedQuantity) && requestedQuantity >= 1 && requestedQuantity <= Math.min(stock, 20));
            assert.deepEqual(inventory, before);
        }
        for (const override of [{ product: null }, { size: 99 }, { color: 'Red' }]) {
            assert.equal(validateStockRequest({ ...request, ...override }, [product], inventory).valid, false);
            assert.deepEqual(inventory, before);
        }
    }
});

test('guard returns the original successful or rejected result when unchanged', () => {
    for (const result of [{ valid: true }, { valid: false, code: 'OUT_OF_STOCK' }]) {
        const inventory = [{ stock: 3 }];
        assert.equal(runReadOnlyInventoryCheck(inventory, () => result), result);
    }
});

test('controlled faulty checks trigger the inventory-modified branch', () => {
    for (const mutate of [
        records => { records[0].stock--; },
        records => { records[0].color = 'White'; },
        records => { records.push({ stock: 1 }); },
        records => { records.pop(); },
    ]) {
        for (const valid of [true, false]) {
            const inventory = [{ productId: 1, color: 'Black', stock: 3 }];
            const result = runReadOnlyInventoryCheck(inventory, () => { mutate(inventory); return { valid }; });
            assert.deepEqual(result, { valid: false, code: 'INVENTORY_MODIFIED',
                message: 'Error: Stock availability check modified inventory', availableStock: null });
        }
    }
});
