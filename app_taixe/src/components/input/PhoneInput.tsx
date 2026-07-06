// 1. IMPORTS
import { AppTextInput } from 'components/input/TextInput';
import { AppText } from 'components/text/AppText';
import { CountryCode } from 'libphonenumber-js';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';
import {
  buildCountryList,
  CountryItem,
  normalizeAndValidate,
  PhoneValidationResult,
  sanitizePhoneInput,
} from 'utils/phone';
import ZustandPersist from 'zustand/persist';
import { useShallow } from 'zustand/react/shallow';
import { CountryPickerModal } from './CountryPickerModal';

// 2. VARIABLES & TYPES
export interface PhoneInputChange extends PhoneValidationResult {
  // The raw national digits the user typed.
  national: string;
  // Selected country ISO2.
  country: CountryCode;
}

interface IPhoneInputProps {
  // Raw national digits (controlled). Parent keeps the source of truth.
  value: string;
  defaultCountry?: CountryCode;
  placeholder?: string;
  autoFocus?: boolean;
  // Border color state, driven by the parent (e.g. Formik touched + error):
  //   undefined / null → neutral border
  //   true             → success (green)
  //   false            → error (red)
  validStatus?: boolean | null;
  onChange: (change: PhoneInputChange) => void;
}

// 3. COMPONENT FUNCTION
export const PhoneInput = React.memo((props: IPhoneInputProps) => {
  const { value, defaultCountry = 'VN', placeholder, autoFocus, validStatus, onChange } = props;
  const theme = useAppTheme();
  const styles = useMemo(() => stylesSheet(theme), [theme]);
  const language = ZustandPersist(useShallow((state) => state?.Localization)) || 'en';

  const countries = useMemo(() => buildCountryList(language), [language]);
  const [country, setCountry] = useState<CountryItem | undefined>(() =>
    countries.find((c) => c.iso2 === defaultCountry)
  );
  const [pickerVisible, setPickerVisible] = useState(false);

  // Border color is fully driven by the parent via validStatus, so the input
  // composes cleanly with form libraries (Formik, etc.) that already own
  // focus/touched/validity. null/undefined → neutral, true → success, false → error.
  const borderColor = useMemo(() => {
    if (validStatus === true) {
      return theme.color.state.success;
    }
    if (validStatus === false) {
      return theme.color.state.error;
    }
    return theme.color.input.border;
  }, [validStatus, theme]);

  // Keep the selected country object in sync if the language (and thus the
  // rebuilt list reference) changes.
  useEffect(() => {
    setCountry((prev) => countries.find((c) => c.iso2 === (prev?.iso2 ?? defaultCountry)));
  }, [countries, defaultCountry]);

  const emitChange = (national: string, iso2: CountryCode) => {
    const result = normalizeAndValidate(national, iso2);
    onChange({ ...result, national, country: iso2 });
  };

  const handleChangeText = (text: string) => {
    // Phone field accepts digits only; strip everything else.
    const digits = sanitizePhoneInput(text).replace('+', '');
    if (country) {
      emitChange(digits, country.iso2);
    }
  };

  const handleSelectCountry = (item: CountryItem) => {
    setCountry(item);
    setPickerVisible(false);
    // Re-validate the existing number against the newly selected country.
    emitChange(value, item.iso2);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.countryButton}
        onPress={() => setPickerVisible(true)}
        activeOpacity={0.7}
      >
        <AppText style={styles.flag}>{country?.flag ?? '🏳️'}</AppText>
        <AppText style={styles.callingCode}>+{country?.callingCode ?? ''}</AppText>
        <AppText style={styles.caret}>▾</AppText>
      </TouchableOpacity>

      <View style={styles.phoneInputWrap}>
        <AppTextInput
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          keyboardType="phone-pad"
          autoFocus={autoFocus}
          style={{ borderColor }}
        />
      </View>

      <CountryPickerModal
        visible={pickerVisible}
        countries={countries}
        selectedIso2={country?.iso2}
        onSelect={handleSelectCountry}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
});

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.dimensions.p8,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.dimensions.p4,
    paddingHorizontal: theme.dimensions.p12,
    paddingVertical: theme.dimensions.p12,
    borderRadius: theme.dimensions.p12,
    borderWidth: 1,
    borderColor: theme.color.input.border,
    backgroundColor: theme.color.background.surface,
  },
  flag: {
    fontSize: theme.fontSize.p20,
  },
  callingCode: {
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
    color: theme.color.text.primary,
  },
  caret: {
    fontSize: theme.fontSize.p12,
    color: theme.color.text.secondary,
  },
  phoneInputWrap: {
    flex: 1,
  },
});

// 5. EXPORT
export default PhoneInput;
