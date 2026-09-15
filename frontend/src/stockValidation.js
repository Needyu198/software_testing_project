import { variationStock } from './variationStock.js';
import { runReadOnlyInventoryCheck } from './inventoryIntegrity.js';
import { validateQuantity } from './quantityValidation.js';

function hasValidProductShape(product) {
    return product !== null && typeof product === 'object' && !Array.isArray(product)
        && Number.isSafeInteger(product.id) && product.id > 0
        && typeof product.name === 'string' && product.name.trim().length > 0
        && Number.isFinite(product.price) && product.price >= 0
        && (product.salePrice === undefined || (Number.isFinite(product.salePrice) && product.salePrice >= 0))
        && Array.isArray(product.sizes) && product.sizes.length > 0
        && product.sizes.every(size => Number.isFinite(size) && size > 0)
        && Array.isArray(product.colors) && product.colors.length > 0
        && product.colors.every(color => typeof color === 'string' && color.trim().length > 0)
        && Array.isArray(product.outOfStock)
        && product.outOfStock.every(size => product.sizes.includes(size));
}

export function resolveCatalogProduct(product, catalog) {
    if (!hasValidProductShape(product)) return null;
    const match = catalog.find(entry => entry.id === product.id);
    return hasValidProductShape(match) ? match : null;
}

export function getCatalogStock(product, size, catalog, color, inventory = variationStock) {
    const match = resolveCatalogProduct(product, catalog);
    if (!match || match.isActive !== true || !match.sizes.includes(size) || !match.colors.includes(color)) return 0;
    const variation = inventory.find(item => item.productId === match.id && item.size === size && item.color === color);
    return variation && Number.isSafeInteger(variation.stock) && variation.stock >= 0 ? variation.stock : 0;
}

export function isValidProductColor(product, color, catalog) {
    const match = resolveCatalogProduct(product, catalog);
    return match !== null && typeof color === 'string' && match.colors.includes(color);
}

export const LOW_STOCK_THRESHOLD = 3;
export const MAX_CART_QUANTITY = 20;

export function getVariationStockStatus(product, size, color, catalog, inventory = variationStock, lowStockThreshold = LOW_STOCK_THRESHOLD) {
    if (!Number.isSafeInteger(lowStockThreshold) || lowStockThreshold < 0) {
        throw new RangeError('Low-stock threshold must be a nonnegative whole number.');
    }
    const result = (status, message, availableStock = null) => ({ status, message, availableStock });
    const match = resolveCatalogProduct(product, catalog);
    if (!match) return result('INVALID_PRODUCT', 'Invalid product. Please select a product from the catalog.');
    if (match.isActive !== true) return result('INACTIVE_PRODUCT', 'This product is not available for purchase.');
    if (size == null) return result('SELECT_SIZE', 'Select a size to check availability');
    if (!match.sizes.includes(size)) return result('INVALID_SIZE', 'Please select a valid size for this product.');
    if (!match.colors.includes(color)) return result('INVALID_COLOR', 'Please select a valid colour for this product.');
    const variation = inventory.find(item => item.productId === match.id && item.size === size && item.color === color);
    if (!variation) return result('VARIATION_UNAVAILABLE', 'This size and colour combination is unavailable.', 0);
    if (!Number.isSafeInteger(variation.stock) || variation.stock < 0) {
        return result('INVALID_STOCK', 'Stock information is unavailable. Please try another variation.');
    }
    const availableStock = variation.stock;
    if (availableStock === 0) return result('OUT_OF_STOCK', 'This size and colour combination is out of stock.', 0);
    if (availableStock <= lowStockThreshold) {
        return result('LOW_STOCK', `Low Stock — Only ${availableStock} left in stock`, availableStock);
    }
    return result('IN_STOCK', `In Stock — ${availableStock} available`, availableStock);
}

// requestedQuantity is the desired total for this cart variation, not an increment.
export function validateStockRequest(request, catalog, inventory = variationStock) {
    return runReadOnlyInventoryCheck(inventory, () => validateStockRequestCore(request, catalog, inventory));
}

function validateStockRequestCore({ product, size, color, requestedQuantity }, catalog, inventory) {
    const reject = (code, message, availableStock = null) => ({ valid: false, code, message, availableStock });
    const quantityError = validateQuantity(requestedQuantity);
    if (quantityError) return reject(quantityError.code, quantityError.message);
    const availability = getVariationStockStatus(product, size, color, catalog, inventory);
    if (!['IN_STOCK', 'LOW_STOCK'].includes(availability.status)) {
        return reject(availability.status, availability.message, availability.availableStock);
    }
    const { availableStock } = availability;
    const effectiveMax = Math.min(MAX_CART_QUANTITY, availableStock);
    if (requestedQuantity > effectiveMax) {
        return availableStock > MAX_CART_QUANTITY
            ? reject('QUANTITY_LIMIT', `Maximum quantity per size and colour is ${MAX_CART_QUANTITY}.`, availableStock)
            : reject('INSUFFICIENT_STOCK', `Maximum available quantity is ${availableStock}.`, availableStock);
    }
    return {
        valid: true,
        code: 'AVAILABLE',
        message: '',
        productId: product.id,
        requestedQuantity,
        availableStock,
        // Informational only: availability checks never reserve or deduct stock.
        remainingStock: availableStock - requestedQuantity,
    };
}
