const REGION_CURRENCY: Record<string, string> = {
  GB: 'GBP', US: 'USD', CA: 'CAD', AU: 'AUD', NZ: 'NZD', IE: 'EUR', IN: 'INR', ZA: 'ZAR', JP: 'JPY', CH: 'CHF',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', PT: 'EUR', FI: 'EUR',
};

function guessCurrency() {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region ?? '';
    return REGION_CURRENCY[region] ?? 'USD';
  } catch {
    return 'USD';
  }
}

const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: guessCurrency(), maximumFractionDigits: 0 });

export function formatMoney(value: number) {
  return currency.format(value);
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
