// THB policy: round unit prices and monetary settings half up to satang (0.01
// baht), multiply rounded unit prices by quantity, then sum integer satang.
// Round percentage discounts once to satang before applying caps. Totals use
// integer satang throughout; display exactly two decimal places.
function decimalRatio(value) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError('Invalid monetary value.');
    const [mantissa, exponent = '0'] = String(value).toLowerCase().split('e');
    const [whole, fraction = ''] = mantissa.split('.');
    const scale = fraction.length - Number(exponent);
    const digits = BigInt(whole + fraction);
    return scale >= 0 ? [digits, 10n ** BigInt(scale)] : [digits * 10n ** BigInt(-scale), 1n];
}
function halfUp(numerator, denominator) {
    const rounded = (numerator * 2n + denominator) / (2n * denominator);
    if (rounded > BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError('Monetary value exceeds supported precision.');
    return Number(rounded);
}
export function toSatang(value) {
    const [numerator, denominator] = decimalRatio(value);
    return halfUp(numerator * 100n, denominator);
}
export function percentageSatang(subtotalSatang, rate) {
    const [numerator, denominator] = decimalRatio(rate);
    return halfUp(BigInt(subtotalSatang) * numerator, denominator * 100n);
}
export function lineTotalSatang(item) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) throw new RangeError('Invalid quantity.');
    const total = toSatang(item.product.salePrice ?? item.product.price) * item.quantity;
    if (!Number.isSafeInteger(total)) throw new RangeError('Monetary value exceeds supported precision.');
    return total;
}
export function formatMoney(value) {
    return (toSatang(value) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
