// Date Utilities

/**
 * Turn a date into a string using the date's time zone
 * @param date The date to turn into a string
 * @returns The date as a string
 */
export function turnDateIntoString(date: Date) {
    return date.toISOString().split('T')[0]
}

/**
 * Get the first day of the month. Will return the first day of the month at 12:00 to avoid time zone issues
 * @param date The date to get the first day of the month for
 * @returns The first day of the month
 */
export function getStartOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1, 12)
}

/**
 * Get the last day of the month. Will return the first day of the month at 12:00 to avoid time zone issues
 * @param date The date to get the last day of the month for
 * @returns The last day of the month
 */
export function getEndOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 12)
}

export const MAX_RANGE_MONTHS = 3

/**
 * Parse a YYYY-MM-DD string into a Date at UTC midnight
 * @param value The date string to parse
 * @returns The parsed date, or null if the string is not a valid date
 */
export function parseDateString(value: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null
    }

    const date = new Date(`${value}T00:00:00.000Z`)
    return isNaN(date.getTime()) ? null : date
}

/**
 * Add a number of days to a date (UTC based)
 * @param date The date to add days to
 * @param days The number of days to add, can be negative
 * @returns A new date
 */
export function addDays(date: Date, days: number) {
    const result = new Date(date)
    result.setUTCDate(result.getUTCDate() + days)
    return result
}

/**
 * Add a number of months to a date (UTC based). If the day does not exist in the
 * target month, the last day of that month is used instead.
 * @param date The date to add months to
 * @param months The number of months to add, can be negative
 * @returns A new date
 */
export function addMonths(date: Date, months: number) {
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth() + months
    const lastDayOfTargetMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
    return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDayOfTargetMonth)))
}

/**
 * Make sure a date range is valid and never longer than the given number of months.
 * The side of the range that was not changed by the user is adjusted.
 * @param from The start of the range (YYYY-MM-DD)
 * @param to The end of the range (YYYY-MM-DD)
 * @param changed Which side of the range the user changed
 * @param maxMonths The maximum length of the range in months
 * @returns The clamped range as YYYY-MM-DD strings
 */
export function clampDateRange(from: string, to: string, changed: 'from' | 'to', maxMonths = MAX_RANGE_MONTHS) {
    const fromDate = parseDateString(from)
    const toDate = parseDateString(to)

    if (!fromDate || !toDate) {
        return { from, to }
    }

    if (changed === 'from') {
        const latestEnd = addMonths(addDays(fromDate, -1), maxMonths)
        if (toDate < fromDate) {
            return { from, to: from }
        }
        if (toDate > latestEnd) {
            return { from, to: turnDateIntoString(latestEnd) }
        }
        return { from, to }
    }

    const earliestStart = addMonths(addDays(toDate, 1), -maxMonths)
    if (fromDate > toDate) {
        return { from: to, to }
    }
    if (fromDate < earliestStart) {
        return { from: turnDateIntoString(earliestStart), to }
    }
    return { from, to }
}

/**
 * Get all days between two dates (inclusive) as YYYY-MM-DD strings
 * @param from The start of the range (YYYY-MM-DD)
 * @param to The end of the range (YYYY-MM-DD)
 * @returns The list of days
 */
export function getDaysInRange(from: string, to: string) {
    const fromDate = parseDateString(from)
    const toDate = parseDateString(to)
    const days: Array<string> = []

    if (!fromDate || !toDate) {
        return days
    }

    for (let day = fromDate; day <= toDate; day = addDays(day, 1)) {
        days.push(turnDateIntoString(day))
    }

    return days
}
