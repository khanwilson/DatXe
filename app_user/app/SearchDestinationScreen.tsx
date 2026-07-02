// 1. IMPORTS
import { ImageSource } from 'assets/index';
import { useAutocomplete, usePlaceDetail } from 'api/hooks/useGoongPlace';
import { PlacePrediction } from 'api/services/goongPlaceService';
import { AppText } from 'components/text/AppText';
import { AppTextInput } from 'components/input/TextInput';
import { RenderImage } from 'components/image/RenderImage';
import Closure from 'utils/Closure';
import ZustandSession from 'zustand/session';
import { getString } from 'localization/index';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ITheme, useAppTheme } from 'theme/index';
import { router } from 'expo-router';

// 2. TYPES
type Styles = ReturnType<typeof stylesSheet>;

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

// A single autocomplete result row with a mount fade-in animation.
interface ResultItemProps {
  item: PlacePrediction;
  styles: Styles;
  onSelect: (prediction: PlacePrediction) => void;
}

const ResultItem = React.memo(({ item, styles, onSelect }: ResultItemProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => onSelect(item)}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel={item.mainText}
      >
        <View style={styles.resultIcon}>
          <View style={styles.resultIconDot} />
        </View>
        <View style={styles.resultText}>
          <AppText style={styles.mainText} numberOfLines={1}>
            {item.mainText}
          </AppText>
          {!!item.secondaryText && (
            <AppText style={styles.secondaryText} numberOfLines={2}>
              {item.secondaryText}
            </AppText>
          )}
        </View>
        <AppText style={styles.chevron}>›</AppText>
      </TouchableOpacity>
    </Animated.View>
  );
});
ResultItem.displayName = 'ResultItem';

// 3. COMPONENT
export default function SearchDestinationScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => stylesSheet(theme), [theme]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const closureRef = useRef(new Closure());
  const shimmer = useRef(new Animated.Value(0)).current;

  const { data: autocompleteData, isLoading, isError, refetch } = useAutocomplete(debouncedQuery);
  const { data: placeDetailData, isLoading: isDetailLoading } = usePlaceDetail(selectedPlaceId);
  const predictions = autocompleteData?.predictions ?? [];

  const showSkeleton = (isLoading || isDetailLoading) && predictions.length === 0;

  const handleTextChange = useCallback((text: string) => {
    setQuery(text);
    setSelectedPlaceId(null);
    closureRef.current.debounce(() => {
      setDebouncedQuery(text);
    }, 300);
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setSelectedPlaceId(null);
  }, []);

  const handleSelect = useCallback((prediction: PlacePrediction) => {
    setSelectedPlaceId(prediction.placeId);
  }, []);

  // When place detail loads, save to session and navigate back.
  useEffect(() => {
    if (placeDetailData && selectedPlaceId) {
      ZustandSession.getState().save('selectedDestination', {
        lat: placeDetailData.location.lat,
        lng: placeDetailData.location.lng,
        name: placeDetailData.name,
        address: placeDetailData.address,
      });
      router.back();
    }
  }, [placeDetailData, selectedPlaceId]);

  useEffect(() => {
    const closure = closureRef.current;
    return () => {
      closure.cleanup();
    };
  }, []);

  // Drive the skeleton shimmer loop only while placeholder rows are visible.
  useEffect(() => {
    if (!showSkeleton) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [showSkeleton, shimmer]);

  const skeletonOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.85],
  });

  const renderItem = useCallback(
    ({ item }: { item: PlacePrediction }) => (
      <ResultItem item={item} styles={styles} onSelect={handleSelect} />
    ),
    [handleSelect, styles]
  );

  const renderSkeleton = () => (
    <View style={styles.listContent}>
      {SKELETON_ROWS.map((row) => (
        <View key={row} style={styles.skeletonRow}>
          <Animated.View style={[styles.skeletonIcon, { opacity: skeletonOpacity }]} />
          <View style={styles.skeletonTextGroup}>
            <Animated.View style={[styles.skeletonLineMain, { opacity: skeletonOpacity }]} />
            <Animated.View style={[styles.skeletonLineSub, { opacity: skeletonOpacity }]} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderEmpty = () => {
    if (showSkeleton) return null;
    const isPrompt = debouncedQuery.length < 2;
    return (
      <View style={styles.stateContainer}>
        <View style={styles.stateIconCircle}>
          <View style={styles.stateIconInner} />
        </View>
        <AppText style={styles.stateText}>
          {isPrompt
            ? getString('searchDestinationPlaceholder')
            : getString('searchNoResults')}
        </AppText>
      </View>
    );
  };

  const renderError = () => (
    <View style={styles.stateContainer}>
      <View style={[styles.stateIconCircle, styles.stateIconCircleError]}>
        <AppText style={styles.stateIconGlyph}>!</AppText>
      </View>
      <AppText style={styles.stateText}>{getString('searchError')}</AppText>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => refetch()}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <AppText style={styles.retryText}>{getString('searchRetry')}</AppText>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={getString('searchDestinationTitle')}
        >
          <RenderImage
            svgMode
            source={ImageSource.ic_arrowLeft}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <AppText style={styles.title}>{getString('searchDestinationTitle')}</AppText>
        <View style={styles.backButton} />
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
          <View style={styles.searchIcon}>
            <View style={styles.searchIconRing} />
            <View style={styles.searchIconHandle} />
          </View>
          <AppTextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleTextChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={getString('searchDestinationPlaceholder')}
            placeholderTextColor={theme.color.input.placeholder}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <AppText style={styles.clearGlyph}>✕</AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isError ? (
        renderError()
      ) : showSkeleton ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={predictions}
          renderItem={renderItem}
          keyExtractor={(item) => item.placeId}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            predictions.length === 0 ? styles.listContentEmpty : styles.listContent
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.background.surfaceAlt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.dimensions.p8,
    paddingVertical: theme.dimensions.p12,
    backgroundColor: theme.color.navigation.headerBg,
  },
  backButton: {
    width: theme.dimensions.p44,
    height: theme.dimensions.p44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: theme.dimensions.p24,
    height: theme.dimensions.p24,
  },
  title: {
    flex: 1,
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
    color: theme.color.navigation.headerText,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: theme.dimensions.p16,
    paddingTop: theme.dimensions.p16,
    paddingBottom: theme.dimensions.p12,
    backgroundColor: theme.color.navigation.headerBg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.color.input.bg,
    borderWidth: 1.5,
    borderColor: theme.color.input.bg,
    borderRadius: theme.dimensions.p12,
    paddingHorizontal: theme.dimensions.p12,
    minHeight: theme.dimensions.p48,
    shadowColor: theme.color.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: theme.dimensions.p6,
    elevation: 3,
  },
  searchBarFocused: {
    borderColor: theme.color.input.borderFocus,
  },
  searchIcon: {
    width: theme.dimensions.p20,
    height: theme.dimensions.p20,
    marginRight: theme.dimensions.p8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconRing: {
    width: theme.dimensions.p12,
    height: theme.dimensions.p12,
    borderRadius: theme.dimensions.p6,
    borderWidth: 2,
    borderColor: theme.color.text.secondary,
  },
  searchIconHandle: {
    position: 'absolute',
    right: theme.dimensions.p2,
    bottom: theme.dimensions.p2,
    width: theme.dimensions.p6,
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.color.text.secondary,
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: theme.dimensions.p12,
    fontSize: theme.fontSize.p16,
    color: theme.color.text.primary,
  },
  clearButton: {
    width: theme.dimensions.p28,
    height: theme.dimensions.p28,
    borderRadius: theme.dimensions.p14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.background.surfaceAlt,
    marginLeft: theme.dimensions.p6,
  },
  clearGlyph: {
    fontSize: theme.fontSize.p12,
    lineHeight: theme.fontSize.p16,
    color: theme.color.text.secondary,
  },
  listContent: {
    paddingVertical: theme.dimensions.p8,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.dimensions.p12,
    marginVertical: theme.dimensions.p4,
    paddingHorizontal: theme.dimensions.p12,
    paddingVertical: theme.dimensions.p12,
    minHeight: theme.dimensions.p56,
    backgroundColor: theme.color.card.bg,
    borderRadius: theme.dimensions.p12,
    borderWidth: 1,
    borderColor: theme.color.border.light,
  },
  resultIcon: {
    width: theme.dimensions.p40,
    height: theme.dimensions.p40,
    borderRadius: theme.dimensions.p20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.background.surfaceAlt,
    marginRight: theme.dimensions.p12,
  },
  resultIconDot: {
    width: theme.dimensions.p12,
    height: theme.dimensions.p12,
    borderRadius: theme.dimensions.p6,
    backgroundColor: theme.color.primary.brandGreen,
  },
  resultText: {
    flex: 1,
  },
  mainText: {
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
    color: theme.color.text.primary,
    marginBottom: theme.dimensions.p2,
  },
  secondaryText: {
    fontSize: theme.fontSize.p14,
    color: theme.color.text.secondary,
  },
  chevron: {
    fontSize: theme.fontSize.p24,
    color: theme.color.text.disabled,
    marginLeft: theme.dimensions.p8,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.dimensions.p12,
    marginVertical: theme.dimensions.p4,
    paddingHorizontal: theme.dimensions.p12,
    paddingVertical: theme.dimensions.p12,
    minHeight: theme.dimensions.p56,
    backgroundColor: theme.color.card.bg,
    borderRadius: theme.dimensions.p12,
  },
  skeletonIcon: {
    width: theme.dimensions.p40,
    height: theme.dimensions.p40,
    borderRadius: theme.dimensions.p20,
    backgroundColor: theme.color.border.light,
    marginRight: theme.dimensions.p12,
  },
  skeletonTextGroup: {
    flex: 1,
  },
  skeletonLineMain: {
    height: theme.dimensions.p12,
    borderRadius: theme.dimensions.p6,
    backgroundColor: theme.color.border.light,
    width: '70%',
    marginBottom: theme.dimensions.p8,
  },
  skeletonLineSub: {
    height: theme.dimensions.p10,
    borderRadius: theme.dimensions.p6,
    backgroundColor: theme.color.border.light,
    width: '45%',
  },
  stateContainer: {
    flex: 1,
    paddingVertical: theme.dimensions.p48,
    paddingHorizontal: theme.dimensions.p32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateIconCircle: {
    width: theme.dimensions.p64,
    height: theme.dimensions.p64,
    borderRadius: theme.dimensions.p32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.background.surface,
    borderWidth: 1,
    borderColor: theme.color.border.light,
    marginBottom: theme.dimensions.p16,
  },
  stateIconCircleError: {
    borderColor: theme.color.state.error,
  },
  stateIconInner: {
    width: theme.dimensions.p20,
    height: theme.dimensions.p20,
    borderRadius: theme.dimensions.p10,
    backgroundColor: theme.color.border.default,
  },
  stateIconGlyph: {
    fontSize: theme.fontSize.p32,
    fontWeight: '700',
    color: theme.color.state.error,
  },
  stateText: {
    fontSize: theme.fontSize.p14,
    color: theme.color.text.secondary,
    textAlign: 'center',
    lineHeight: theme.fontSize.p20,
  },
  retryButton: {
    marginTop: theme.dimensions.p16,
    paddingHorizontal: theme.dimensions.p24,
    paddingVertical: theme.dimensions.p12,
    backgroundColor: theme.color.button.primaryBg,
    borderRadius: theme.dimensions.p12,
    minHeight: theme.dimensions.p44,
    justifyContent: 'center',
  },
  retryText: {
    fontSize: theme.fontSize.p14,
    fontWeight: '600',
    color: theme.color.button.primaryText,
  },
});
