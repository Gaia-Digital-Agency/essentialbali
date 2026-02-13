import { format, parseISO, isValid } from 'date-fns';

export const formatPublished = (inputDate: string | undefined | number) => {
    if(!inputDate) return
    try {
        const date = typeof inputDate === 'string' ? parseISO(inputDate) : new Date(inputDate);
        if (!isValid(date)) {
            return '';
        }
        const formatted = format(date, 'dd MMMM yyyy');
        return formatted;
    } catch (error) {
        // Fallback for invalid date format
        const date = new Date(inputDate);
        if (isNaN(date.getTime())) {
            return '';
        }
        const formatted = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
        return formatted === 'Invalid Date' ? '' : formatted;
    }
}

export const getCurrencySymbol = (currencyCode: string) => {
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    const formatted = formatter.format(0);
    const symbol = formatted.replace(/[0-9.,\s]/g, '');

    return symbol.trim();
  } catch (error) {
    console.error(`Error getting currency symbol for ${currencyCode}:`, error);
    return null;
  }
}

export const timeAgo = (dateString: string | undefined, currentDate?: string | null): string => {
    // 1. Add a guard clause for undefined or empty input.
    if (!dateString) {
        return '';
    }

    if(!currentDate) {
        return ''
    }

    // 2. Directly parse the ISO 8601 string. No regex needed.
    const date = new Date(dateString);

    // 3. Keep the validation check.
    if (isNaN(date.getTime())) {
        console.error("Invalid ISO 8601 date string provided:", dateString);
        return '';
    }

    const now = new Date(currentDate);
    const diffSeconds = (now.getTime() - date.getTime()) / 1000;

    // Handle times less than a minute ago
    if (Math.abs(diffSeconds) < 60) {
        return 'just now';
    }

    // The excellent relative time formatting logic remains unchanged.
    const units: { unit: Intl.RelativeTimeFormatUnit, seconds: number }[] = [
        { unit: 'year',   seconds: 31536000 },
        { unit: 'month',  seconds: 2592000 },
        { unit: 'week',   seconds: 604800 },
        { unit: 'day',    seconds: 86400 },
        { unit: 'hour',   seconds: 3600 },
        { unit: 'minute', seconds: 60 },
    ];
    
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    for (const { unit, seconds } of units) {
        const interval = diffSeconds / seconds;
        if (Math.abs(interval) >= 1) {
            // rtf.format expects a negative value for past dates.
            return rtf.format(-Math.round(interval), unit);
        }
    }

    // Fallback just in case, though the "just now" check should cover this.
    return rtf.format(-Math.round(diffSeconds), 'second');
}
