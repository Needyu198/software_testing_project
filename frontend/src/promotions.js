// In-memory demo redemptions reset on reload. Each app session consumes at most
// one use per promotion, even after navigation, removal or repeated Apply clicks.
const redeemedSessions = new WeakMap();

export function redeemDemoPromotion(promotion, session) {
    const { redemptionCount, redemptionLimit } = promotion;
    if (!Number.isSafeInteger(redemptionCount) || redemptionCount < 0
        || !Number.isSafeInteger(redemptionLimit) || redemptionLimit < 0) {
        return 'This discount code has invalid redemption limits.';
    }
    const redeemed = redeemedSessions.get(session);
    if (redeemed?.has(promotion)) return '';
    if (redemptionCount >= redemptionLimit) {
        return 'This discount code has reached its redemption limit.';
    }
    promotion.redemptionCount += 1;
    const updated = redeemed ?? new Set();
    updated.add(promotion);
    redeemedSessions.set(session, updated);
    return '';
}

export const promotions = [
        // Demo periods use Bangkok time; both endpoints are inclusive.
        { code: 'WELCOME10', discount: '10%', minSpend: 1500, redemptionCount: 124, redemptionLimit: 500, startsAt: '2026-01-01T00:00:00.000+07:00', endsAt: '2026-12-31T23:59:59.999+07:00', expires: '31 Dec 2026', status: 'Active' },
        { code: 'SUMMER40', discount: '40%', minSpend: 3000, redemptionCount: 892, redemptionLimit: 1000, startsAt: '2026-06-01T00:00:00.000+07:00', endsAt: '2026-08-31T23:59:59.999+07:00', expires: '31 Aug 2026', status: 'Active' },
        { code: 'MEMBER20', discount: '20%', minSpend: 2000, redemptionCount: 201, redemptionLimit: 300, startsAt: '2026-09-01T00:00:00.000+07:00', endsAt: '2026-09-30T23:59:59.999+07:00', expires: '30 Sep 2026', status: 'Active' },
    ];
