"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDuration = void 0;
/**
 * @function formatDuration
 * @description Converts a decimal hour value into a "X hours Y minutes" string.
 * @param {number | null | undefined} hoursDecimal - The duration in decimal hours.
 * @returns {string} The formatted duration string.
 */
const formatDuration = (hoursDecimal) => {
    if (hoursDecimal === null ||
        hoursDecimal === undefined ||
        isNaN(hoursDecimal)) {
        return 'N/A';
    }
    const totalMinutes = Math.round(hoursDecimal * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let result = '';
    if (hours > 0) {
        result += `${hours} hour${hours > 1 ? 's' : ''} `;
    }
    if (minutes > 0) {
        result += `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return result.trim() || '0 minutes';
};
exports.formatDuration = formatDuration;
