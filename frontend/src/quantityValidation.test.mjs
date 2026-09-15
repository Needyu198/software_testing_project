import test from 'node:test';
import assert from 'node:assert/strict';
import { validateQuantity } from './quantityValidation.js';

for (const [label, inputs, code, message] of [
    ['missing', [undefined, null, '', '  '], 'QUANTITY_REQUIRED', 'Requested quantity is required'],
    ['nonnumeric', ['abc', '2', NaN, Infinity, -Infinity, true, [], {}], 'QUANTITY_NOT_NUMERIC', 'Requested quantity must be a number'],
    ['nonpositive', [0, -1, -0.5], 'QUANTITY_NOT_POSITIVE', 'Requested quantity must be greater than zero'],
    ['decimal', [0.5, 1.5], 'QUANTITY_NOT_INTEGER', 'Requested quantity must be a whole number'],
    ['unsafe', [Number.MAX_SAFE_INTEGER + 1], 'QUANTITY_UNSAFE', 'Requested quantity exceeds the supported integer range'],
]) {
    test(`${label} quantity has a distinct code and exact message`, () => {
        for (const input of inputs) assert.deepEqual(validateQuantity(input), { code, message });
    });
}

test('positive safe integers pass input validation; stock limits are checked separately', () => {
    for (const quantity of [1, 2, 20, 21, Number.MAX_SAFE_INTEGER]) assert.equal(validateQuantity(quantity), null);
});
