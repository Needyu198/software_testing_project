import { resolveCatalogProduct, validateStockRequest, getVariationStockStatus } from './stockValidation.js';
import { validateQuantity } from './quantityValidation.js';

// Identify the line by variation so queued actions cannot target a shifted index.
export function updateCartQuantity(cart, selection, action, catalog, inventory) {
    const reject = (code, message) => ({ cart, code, message, type: 'error' });
    if (action !== 'increase' && action !== 'decrease') {
        return reject('ERROR_INVALID_ACTION', 'Invalid cart action. Use increase or decrease.');
    }
    const index = cart.findIndex(item => item.product.id === selection?.productId
        && item.size === selection?.size && item.color === selection?.color);
    if (index < 0) return reject('ERROR_INVALID_ITEM', 'This item is no longer in your bag.');
    const item = cart[index];
    const quantityError = validateQuantity(item.quantity);
    if (quantityError) return reject(quantityError.code, quantityError.message);
    const availability = getVariationStockStatus(item.product, item.size, item.color, catalog, inventory);
    if (availability.status === 'OUT_OF_STOCK') {
        return { cart: cart.filter((_, i) => i !== index), code: 'REMOVED_OUT_OF_STOCK', quantity: 0,
            message: 'This size and colour combination is now out of stock. Item removed from your bag.', type: 'info' };
    }
    if (action === 'decrease' && item.quantity === 1) {
        return { cart: cart.filter((_, i) => i !== index), code: 'REMOVED', quantity: 0,
            message: 'Item removed from your bag.', type: 'info' };
    }
    const quantity = item.quantity + (action === 'increase' ? 1 : -1);
    const validation = validateStockRequest({ product: item.product, size: item.size, color: item.color, requestedQuantity: quantity }, catalog, inventory);
    if (!validation.valid) return reject(validation.code, validation.message);
    return { cart: cart.map((entry, i) => i === index ? { ...entry, quantity } : entry),
        code: 'UPDATED', quantity, message: 'Quantity updated', type: 'success' };
}

// Pure transition: React can replay this against the latest state safely.
// requestedQty is the number of units to add, not the desired final quantity.
export function addCartItem(cart, requestedProduct, size, color, catalog, inventory, requestedQty = 1) {
    const quantityError = validateQuantity(requestedQty);
    if (quantityError) return { cart, ...quantityError, type: 'error' };
    const product = resolveCatalogProduct(requestedProduct, catalog);
    if (!product) {
        return { cart, message: 'Invalid product. Please select a product from the catalog.', type: 'error' };
    }
    const existing = cart.findIndex(item => item.product.id === product.id && item.size === size && item.color === color);
    const quantity = existing < 0 ? requestedQty : cart[existing].quantity + requestedQty;
    const validation = validateStockRequest({ product, size, color, requestedQuantity: quantity }, catalog, inventory);
    if (!validation.valid) return { cart, message: validation.message, type: 'error' };
    const updated = existing < 0
        ? [...cart, { product, size, color, quantity }]
        : cart.map((item, index) => index === existing ? { ...item, quantity } : item);
    return { cart: updated, message: 'Product added to your bag.', type: 'success' };
}
