import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';

export function useCurrency() {
    const { company } = usePage<SharedData>().props;
    const currencyCode = company?.currency || 'IDR';
    const locale = currencyCode === 'IDR' ? 'id-ID' : 'en-US';

    const format = (amount: number | string | null | undefined) => {
        if (amount === null || amount === undefined) {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currencyCode,
            }).format(0);
        }

        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
        }).format(numericAmount);
    };

    return {
        format,
        currencyCode,
        locale
    };
}
