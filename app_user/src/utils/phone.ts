// 1. IMPORTS
import {
  CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';
import { COUNTRY_NAMES } from 'utils/countryNames';

// 2. VARIABLES & TYPES
export interface CountryItem {
  // ISO 3166-1 alpha-2 code, e.g. "VN".
  iso2: CountryCode;
  // Calling code without the plus, e.g. "84".
  callingCode: string;
  // Localized display name, falls back to the ISO code.
  name: string;
  // Emoji flag derived from the ISO code.
  flag: string;
}

export interface PhoneValidationResult {
  valid: boolean;
  // E.164 formatted number when valid, e.g. "+84346686622". Empty when invalid.
  e164: string;
}

// Offset between an uppercase ASCII letter and its regional indicator symbol.
const REGIONAL_INDICATOR_OFFSET = 0x1f1e6 - 0x41;

// Derive the emoji flag for an ISO 3166-1 alpha-2 country code.
export const getFlagEmoji = (iso2: string): string => {
  const code = iso2.toUpperCase();
  if (code.length !== 2) {
    return '';
  }
  return String.fromCodePoint(
    ...[...code].map((char) => char.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET)
  );
};

// Resolve a localized country name from the pre-generated CLDR-based map.
// Intl.DisplayNames is intentionally NOT used: Hermes ships without full-ICU,
// so it throws and every name would fall back to the raw ISO code. Falls back
// to the ISO code only for codes missing from the map.
export const getCountryName = (iso2: string, language: string): string => {
  const entry = COUNTRY_NAMES[iso2.toUpperCase()];
  if (!entry) {
    return iso2;
  }
  return language === 'vi' ? entry.vi : entry.en;
};

// Build the full sorted country list for the picker.
export const buildCountryList = (language: string): CountryItem[] => {
  return getCountries()
    .map((iso2) => ({
      iso2,
      callingCode: getCountryCallingCode(iso2),
      name: getCountryName(iso2, language),
      flag: getFlagEmoji(iso2),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Keep only digits, preserving a single leading "+" if present. Any other
// character (letters, spaces, dashes, dots) is dropped.
export const sanitizePhoneInput = (raw: string): string => {
  const hasPlus = raw.trim().startsWith('+');
  const digits = raw.replace(/[^0-9]/g, '');
  return hasPlus ? `+${digits}` : digits;
};

// Validate a national number against the selected country and return the
// canonical E.164 form. libphonenumber-js already tolerates the common ways a
// user may type the number for the selected country:
//   country VN (+84):
//     "0346686622"    (national with trunk 0)
//     "346686622"     (national without trunk 0)
//     "84346686622"   (calling code repeated, no plus)
//     "+84346686622"  (full international)
// all parse to "+84346686622".
export const normalizeAndValidate = (
  raw: string,
  iso2: CountryCode
): PhoneValidationResult => {
  const sanitized = sanitizePhoneInput(raw);
  if (!sanitized) {
    return { valid: false, e164: '' };
  }
  const parsed = parsePhoneNumberFromString(sanitized, iso2);
  if (parsed && parsed.isValid()) {
    return { valid: true, e164: parsed.number };
  }
  return { valid: false, e164: '' };
};
