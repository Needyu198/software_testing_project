import { resolveCatalogProduct, validateStockRequest } from './stockValidation.js';

// Pure transition: React can replay this against the latest state safely.
// requestedQty is the number of units to add, not the desired final quantity.
export function addCartItem(cart, requestedProduct, size, color, catalog, inventory, requestedQty = 1) {
    if (!Number.isSafeInteger(requestedQty) || requestedQty < 1) {
        return { cart, message: 'Quantity must be a positive whole number.', type: 'error' };
    }
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
