// 1. IMPORTS
import { AppTextInput } from 'components/input/TextInput';
import { AppText } from 'components/text/AppText';
import { getString } from 'localization/index';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ITheme, useAppTheme } from 'theme/index';
import { CountryItem } from 'utils/phone';

// 2. VARIABLES & TYPES
const SCREEN_HEIGHT = Dimensions.get('window').height;
// The dropdown panel covers 75% of the screen height per spec.
const PANEL_HEIGHT_RATIO = 0.75;

interface ICountryPickerModalProps {
  visible: boolean;
  countries: CountryItem[];
  selectedIso2?: string;
  onSelect: (country: CountryItem) => void;
  onClose: () => void;
}

const matchesQuery = (country: CountryItem, query: string): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  // Allow searching by name, ISO code, calling code, with or without a "+".
  const normalizedCode = q.replace('+', '');
  return (
    country.name.toLowerCase().includes(q) ||
    country.iso2.toLowerCase().includes(q) ||
    country.callingCode.includes(normalizedCode)
  );
};

// 3. COMPONENT FUNCTION
export const CountryPickerModal = React.memo((props: ICountryPickerModalProps) => {
  const { visible, countries, selectedIso2, onSelect, onClose } = props;
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => stylesSheet(theme), [theme]);
  const [query, setQuery] = useState('');

  const data = useMemo(
    () => countries.filter((c) => matchesQuery(c, query)),
    [countries, query]
  );

  const renderItem = ({ item }: { item: CountryItem }) => {
    const active = item.iso2 === selectedIso2;
    return (
      <TouchableOpacity
        style={[styles.row, active && styles.rowActive]}
        onPress={() => {
          onSelect(item);
          setQuery('');
        }}
        activeOpacity={0.7}
      >
        <AppText style={styles.flag}>{item.flag}</AppText>
        <AppText style={styles.name} numberOfLines={1}>
          {item.name}
        </AppText>
        <AppText style={styles.code}>+{item.callingCode}</AppText>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.panel, { paddingBottom: insets.bottom }]}>
        <View style={styles.handle} />
        <AppText style={styles.title}>{getString('countryPickerTitle')}</AppText>

        {/* Sticky search box at the top of the panel. */}
        <View style={styles.searchWrap}>
          <AppTextInput
            placeholder={getString('countryPickerSearch')}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.iso2}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={20}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <AppText style={styles.empty}>{getString('countryPickerEmpty')}</AppText>
          }
        />
      </View>
    </Modal>
  );
});

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.color.overlay,
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * PANEL_HEIGHT_RATIO,
    backgroundColor: theme.color.background.surface,
    borderTopLeftRadius: theme.dimensions.p20,
    borderTopRightRadius: theme.dimensions.p20,
    paddingHorizontal: theme.dimensions.p16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.color.border.light,
    marginTop: theme.dimensions.p8,
    marginBottom: theme.dimensions.p12,
  },
  title: {
    fontSize: theme.fontSize.p20,
    fontWeight: '700',
    color: theme.color.text.primary,
    marginBottom: theme.dimensions.p12,
  },
  searchWrap: {
    marginBottom: theme.dimensions.p12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.dimensions.p12,
    gap: theme.dimensions.p12,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border.light,
  },
  rowActive: {
    backgroundColor: theme.color.background.surfaceAlt,
  },
  flag: {
    fontSize: theme.fontSize.p24,
  },
  name: {
    flex: 1,
    fontSize: theme.fontSize.p16,
    color: theme.color.text.primary,
  },
  code: {
    fontSize: theme.fontSize.p16,
    color: theme.color.text.secondary,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: theme.color.text.secondary,
    marginTop: theme.dimensions.p24,
    fontSize: theme.fontSize.p16,
  },
});
