import * as XLSX from 'xlsx';

/**
 * Extracts a value from an Excel row object based on a list of candidate keys.
 * Safely converts to a string representation if a match is found.
 */
export const getExcelValue = (obj: any, candidates: string[]): string | undefined => {
    if (!obj) return undefined;
    for (const key of Object.keys(obj)) {
        if (candidates.includes(key.toLowerCase())) {
            const val = obj[key];
            return val !== null && val !== undefined ? String(val).trim() : undefined;
        }
    }
    return undefined;
};

/**
 * Parses dates specifically from Excel files. Handles Excel serial date numbers,
 * string approximations (eg. DD/MM/YYYY), and corrects Buddhist Era (BE) dates back to AD.
 */
export const parseExcelDate = (rawDate: any): string => {
    if (!rawDate) return new Date().toISOString();
    let d = new Date();

    if (typeof rawDate === 'number') {
        const parsed = XLSX.SSF.parse_date_code(rawDate);
        // JS dates are 0-indexed for months
        d = new Date(parsed.y, parsed.m - 1, parsed.d);
    } else if (rawDate instanceof Date) {
        d = new Date(rawDate);
    } else if (typeof rawDate === 'string') {
        // Try DD/MM/YYYY
        const parts = rawDate.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            let year = parseInt(parts[2], 10);
            // Convert BE to AD if it's over 2400
            if (year > 2400) year -= 543;
            d = new Date(year, month, day);
        } else {
            const parsed = new Date(rawDate);
            if (!isNaN(parsed.getTime())) d = parsed;
        }
    }

    // Final check for BE year in Date object
    if (d.getFullYear() > 2400) {
        d.setFullYear(d.getFullYear() - 543);
    }

    return d.toISOString();
};
