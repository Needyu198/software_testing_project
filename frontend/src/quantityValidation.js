export function validateQuantity(quantity) {
    if (quantity == null || (typeof quantity === 'string' && quantity.trim() === '')) {
        return { code: 'QUANTITY_REQUIRED', message: 'Requested quantity is required' };
    }
    if (typeof quantity !== 'number' || !Number.isFinite(quantity)) {
        return { code: 'QUANTITY_NOT_NUMERIC', message: 'Requested quantity must be a number' };
    }
    if (quantity <= 0) {
        return { code: 'QUANTITY_NOT_POSITIVE', message: 'Requested quantity must be greater than zero' };
    }
    if (!Number.isInteger(quantity)) {
        return { code: 'QUANTITY_NOT_INTEGER', message: 'Requested quantity must be a whole number' };
    }
    if (!Number.isSafeInteger(quantity)) {
        return { code: 'QUANTITY_UNSAFE', message: 'Requested quantity exceeds the supported integer range' };
    }
    return null;
}
