const MAX_LOCAL_DIGITS = 11; // Includes leading 0 (e.g., 09XXXXXXXXX)
const MAX_SUBSCRIBER_DIGITS = 10; // Digits after removing country code or leading 0

const digitsOnly = (value: string | undefined | null): string => (value ?? '').replace(/\D/g, '');

const toSubscriberDigits = (value: string | undefined | null): string => {
    let digits = digitsOnly(value);

    if (digits.startsWith('63')) {
        digits = digits.slice(2);
    }

    if (digits.startsWith('0')) {
        digits = digits.slice(1);
    }

    if (digits.length > MAX_SUBSCRIBER_DIGITS) {
        digits = digits.slice(0, MAX_SUBSCRIBER_DIGITS);
    }

    return digits;
};

export const sanitizePhoneDigits = (value: string | undefined | null): string =>
    digitsOnly(value).slice(0, MAX_LOCAL_DIGITS);

export const stripCountryCode = (phone: string | undefined | null): string =>
    toSubscriberDigits(phone);

export const formatPhoneNumber = (phone: string | undefined | null): string => {
    const subscriber = toSubscriberDigits(phone);
    return subscriber ? `+63${subscriber}` : '';
};
