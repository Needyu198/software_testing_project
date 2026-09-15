import { validateStockRequest } from './stockValidation.js';

export function validateOrderStock(cart, catalog, inventory) {
    if (!Array.isArray(cart) || cart.length === 0) {
        return { valid: false, errors: [{ code: 'EMPTY_CART', message: 'Your bag is empty.' }] };
    }
    const errors = [];
    cart.forEach((item, index) => {
        const result = validateStockRequest({ product: item?.product, size: item?.size,
            color: item?.color, requestedQuantity: item?.quantity }, catalog, inventory);
        if (!result.valid) {
            errors.push({ ...result, lineIndex: index,
                message: `Item ${index + 1} (${item?.product?.name ?? 'Unknown product'}): ${result.message}` });
        }
    });
    return { valid: errors.length === 0, errors };
}
