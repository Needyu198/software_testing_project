// Inventory consists of plain, serializable demo records. Compare values rather
// than array references: a copied array is a different object even when unchanged.
export function runReadOnlyInventoryCheck(inventory, check) {
    const before = JSON.stringify(inventory);
    const result = check();
    if (JSON.stringify(inventory) !== before) {
        return {
            valid: false,
            code: 'INVENTORY_MODIFIED',
            message: 'Error: Stock availability check modified inventory',
            availableStock: null,
        };
    }
    return result;
}
