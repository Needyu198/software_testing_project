import { variationStock } from './variationStock.js';

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
    if (!match || !match.sizes.includes(size) || !match.colors.includes(color)) return 0;
    const variation = inventory.find(item => item.productId === match.id && item.size === size && item.color === color);
    return variation && Number.isSafeInteger(variation.stock) && variation.stock >= 0 ? variation.stock : 0;
}

export function isValidProductColor(product, color, catalog) {
    const match = resolveCatalogProduct(product, catalog);
    return match !== null && typeof color === 'string' && match.colors.includes(color);
}

export function getVariationStockStatus(product, size, color, catalog, inventory = variationStock) {
    const availableStock = getCatalogStock(product, size, catalog, color, inventory);
    return {
        status: availableStock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
        availableStock,
    };
}

// requestedQuantity is the desired total for this cart variation, not an increment.
export function validateStockRequest({ product, size, color, requestedQuantity }, catalog, inventory = variationStock) {
    const reject = (code, message, availableStock = null) => ({ valid: false, code, message, availableStock });
    if (!Number.isSafeInteger(requestedQuantity) || requestedQuantity < 1) {
        return reject('INVALID_QUANTITY', 'Quantity must be a positive whole number.');
    }
    const match = resolveCatalogProduct(product, catalog);
    if (!match) return reject('INVALID_PRODUCT', 'Invalid product. Please select a product from the catalog.');
    if (!match.sizes.includes(size)) return reject('INVALID_SIZE', 'Please select a valid size for this product.');
    if (!match.colors.includes(color)) return reject('INVALID_COLOR', 'Please select a valid colour for this product.');
    const availableStock = getCatalogStock(match, size, catalog, color, inventory);
    if (availableStock === 0) {
        return reject('OUT_OF_STOCK', 'This size and colour combination is out of stock.', availableStock);
    }
    if (requestedQuantity > availableStock) {
        return reject('INSUFFICIENT_STOCK', `Maximum available quantity is ${availableStock}.`, availableStock);
    }
    return { valid: true, code: 'AVAILABLE', message: '', availableStock };
}
