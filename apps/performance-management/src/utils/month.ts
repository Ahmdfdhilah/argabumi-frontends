// Utils for month conversion
export const getMonthName = (monthNumber: number): string => {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthNumber - 1] || '';
};

// All 12 months
export const allMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
