import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDiscountCodeInput } from './discountValidation.js';

test('empty or missing codes request a discount code', () => {
    for (const input of ['', null, undefined]) {
        assert.deepEqual(validateDiscountCodeInput(input), { code: null, error: 'Please enter a discount code' });
    }
});

test('whitespace-only and non-string codes request a valid code', () => {
    for (const input of [' ', '\t\n', '\u00a0', 123, false, [], {}]) {
        assert.deepEqual(validateDiscountCodeInput(input), { code: null, error: 'Please enter a valid discount code' });
    }
});

test('nonempty strings are normalized for the existing exact lookup', () => {
    assert.deepEqual(validateDiscountCodeInput(' welcome10 '), { code: 'WELCOME10', error: '' });
    assert.deepEqual(validateDiscountCodeInput('UNKNOWN'), { code: 'UNKNOWN', error: '' });
});
