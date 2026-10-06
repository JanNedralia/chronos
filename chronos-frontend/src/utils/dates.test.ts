import { clampDateRange, getDaysInRange, getEndOfMonth, getStartOfMonth, turnDateIntoString } from './dates'

describe('Date Utils', () => {
    describe('getEndOfMonth', () => {
        it('should get end of month for january', () => {
            const date = new Date('2021-01-15')
            const endOfMonth = getEndOfMonth(date)

            expect(endOfMonth.getFullYear()).toEqual(2021)
            expect(endOfMonth.getMonth()).toEqual(0)
            expect(endOfMonth.getDate()).toEqual(31)
        })

        it('should get end of month for february', () => {
            const date = new Date('2021-02-15')
            const endOfMonth = getEndOfMonth(date)

            expect(endOfMonth.getFullYear()).toEqual(2021)
            expect(endOfMonth.getMonth()).toEqual(1)
            expect(endOfMonth.getDate()).toEqual(28)
        })

        it('should return the last day of the month when input is last day', () => {
            const date = new Date('2021-02-28')
            const endOfMonth = getEndOfMonth(date)

            expect(endOfMonth.getFullYear()).toEqual(2021)
            expect(endOfMonth.getMonth()).toEqual(1)
            expect(endOfMonth.getDate()).toEqual(28)
        })

        it('should return the last day of the month when input is first day', () => {
            const date = new Date('2021-02-01')
            const endOfMonth = getEndOfMonth(date)

            expect(endOfMonth.getFullYear()).toEqual(2021)
            expect(endOfMonth.getMonth()).toEqual(1)
            expect(endOfMonth.getDate()).toEqual(28)
        })
    })

    describe('getStartOfMonth', () => {
        it('should get start of month for january', () => {
            const date = new Date('2021-01-15')
            const startOfMonth = getStartOfMonth(date)

            expect(startOfMonth.getFullYear()).toEqual(2021)
            expect(startOfMonth.getMonth()).toEqual(0)
            expect(startOfMonth.getDate()).toEqual(1)
        })

        it('should get start of month for february', () => {
            const date = new Date('2021-02-15')
            const startOfMonth = getStartOfMonth(date)

            expect(startOfMonth.getFullYear()).toEqual(2021)
            expect(startOfMonth.getMonth()).toEqual(1)
            expect(startOfMonth.getDate()).toEqual(1)
        })
    })

    describe('turnDateIntoString', () => {
        it('should turn date into string', () => {
            const date = new Date('2021-01-15')
            const dateString = turnDateIntoString(date)

            expect(dateString).toEqual('2021-01-15')
        })
    })

    describe('clampDateRange', () => {
        it('should keep a valid range untouched', () => {
            expect(clampDateRange('2024-01-01', '2024-03-31', 'from')).toEqual({ from: '2024-01-01', to: '2024-03-31' })
            expect(clampDateRange('2024-01-01', '2024-03-31', 'to')).toEqual({ from: '2024-01-01', to: '2024-03-31' })
        })

        it('should move the end date when the start date makes the range too long', () => {
            expect(clampDateRange('2024-01-01', '2024-06-30', 'from')).toEqual({ from: '2024-01-01', to: '2024-03-31' })
        })

        it('should move the start date when the end date makes the range too long', () => {
            expect(clampDateRange('2024-01-01', '2024-06-30', 'to')).toEqual({ from: '2024-04-01', to: '2024-06-30' })
        })

        it('should not allow the end date to be before the start date', () => {
            expect(clampDateRange('2024-05-10', '2024-05-01', 'from')).toEqual({ from: '2024-05-10', to: '2024-05-10' })
            expect(clampDateRange('2024-05-10', '2024-05-01', 'to')).toEqual({ from: '2024-05-01', to: '2024-05-01' })
        })

        it('should handle month ends', () => {
            expect(clampDateRange('2024-11-30', '2025-12-31', 'from')).toEqual({ from: '2024-11-30', to: '2025-02-28' })
            expect(clampDateRange('2024-01-31', '2024-12-31', 'from')).toEqual({ from: '2024-01-31', to: '2024-04-30' })
        })
    })

    describe('getDaysInRange', () => {
        it('should list every day in the range inclusive', () => {
            expect(getDaysInRange('2024-02-27', '2024-03-02')).toEqual([
                '2024-02-27', '2024-02-28', '2024-02-29', '2024-03-01', '2024-03-02'
            ])
        })

        it('should return an empty list for invalid input', () => {
            expect(getDaysInRange('', '2024-03-02')).toEqual([])
            expect(getDaysInRange('2024-03-05', '2024-03-02')).toEqual([])
        })
    })
})
