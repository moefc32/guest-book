/*!
 * Copyright (c) 2025 Faizal Chan.
 * Licensed under the MIT License.

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export default function parseByte(size, fallbackSize = false) {
    const multipliers = {
        B: 1,
        KB: 1024,
        MB: 1024 ** 2,
        GB: 1024 ** 3,
        TB: 1024 ** 4,
    };

    function normalize(input) {
        if (typeof input === 'number' && Number.isFinite(input)) {
            return Math.floor(input);
        }

        if (typeof input !== 'string') {
            return null;
        }

        const value = input.trim().toUpperCase();

        if (/^\d+(\.\d+)?$/.test(value)) {
            return Math.floor(parseFloat(value));
        }

        const match = value.match(/^(\d+(\.\d+)?)\s*(B|KB|MB|GB|TB|PB)$/);
        if (!match) return null;

        const amount = parseFloat(match[1]);
        const unit = match[3];

        return Math.floor(amount * multipliers[unit]);
    }

    const parsed = normalize(size);
    if (parsed !== null) return parsed;

    const fallback = normalize(fallbackSize);
    return (fallback !== null) ? fallback : fallbackSize;
}
