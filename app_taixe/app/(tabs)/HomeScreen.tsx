// 1. IMPORTS
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppMap } from 'components/map/AppMap';
import { AppText } from 'components/text/AppText';
import { ITheme, useAppTheme } from 'theme/index';
import { useTranslation } from 'react-i18next';
import { useDriverLocation } from 'api/hooks/useDriverLocation';
import { useDriverSocket, NewOfferPayload } from 'api/hooks/useDriverSocket';
import { apiClient } from 'api/axios/client';
import { ENDPOINTS } from 'api/axios/config';

// 2. VARIABLES & TYPES
interface DashboardStats {
  tripsToday: number;
}

// 3. COMPONENT FUNCTION
export default function HomeScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const styles = useMemo(() => stylesSheet(theme), [theme]);

  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({ tripsToday: 0 });

  const { location, error: locationError, startBroadcasting, stopBroadcasting } = useDriverLocation();

  // Handle new offer from WebSocket
  const handleNewOffer = useCallback((payload: NewOfferPayload) => {
    console.debug('[Dashboard] New offer received:', payload.offerId);
    // TODO: Navigate to offer screen (T-0070)
    // router.push(`/OfferScreen?offerId=${payload.offerId}`);
  }, []);

  // Wire up WebSocket listener
  useDriverSocket({
    enabled: isOnline,
    onNewOffer: handleNewOffer,
  });

  // Toggle online/offline status
  const handleToggleOnline = useCallback(async () => {
    try {
      if (isOnline) {
        // Go offline
        await apiClient.post(ENDPOINTS.DRIVER.GO_OFFLINE);
        stopBroadcasting();
        setIsOnline(false);
        console.debug('[Dashboard] Went offline');
      } else {
        // Go online
        await apiClient.post(ENDPOINTS.DRIVER.GO_ONLINE);
        await startBroadcasting();
        setIsOnline(true);
        console.debug('[Dashboard] Went online');

        // Fetch stats (mock in dev)
        if (__DEV__) {
          setStats({ tripsToday: 0 });
        } else {
          const response = await apiClient.get<DashboardStats>(ENDPOINTS.DRIVER.GET_STATS);
          setStats(response);
        }
      }
    } catch (err) {
      console.debug('[Dashboard] Toggle failed:', err);
    }
  }, [isOnline, startBroadcasting, stopBroadcasting]);

  // Camera position for map
  const camera = useMemo(() => {
    if (location) {
      return {
        centerCoordinate: [location.lng, location.lat] as [number, number],
        zoomLevel: 15,
      };
    }
    return undefined;
  }, [location]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <AppMap camera={camera} />
      </View>

      {/* Status overlay */}
      <View style={styles.overlay}>
        {/* Status indicator */}
        <View style={[styles.statusCard, isOnline ? styles.statusOnline : styles.statusOffline]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
            <AppText style={styles.statusText}>
              {isOnline ? t('dashboardOnline') : t('dashboardOffline')}
            </AppText>
          </View>
          <AppText style={styles.statsText}>
            {t('dashboardTripsToday')}: {stats.tripsToday}
          </AppText>
        </View>

        {/* Location error */}
        {locationError && (
          <View style={styles.errorCard}>
            <AppText style={styles.errorText}>{locationError}</AppText>
          </View>
        )}

        {/* Waiting for offer message */}
        {isOnline && (
          <View style={styles.waitingCard}>
            <AppText style={styles.waitingText}>{t('dashboardWaitingForOffer')}</AppText>
          </View>
        )}

        {/* Toggle button */}
        <TouchableOpacity
          style={[styles.toggleButton, isOnline ? styles.buttonOffline : styles.buttonOnline]}
          onPress={handleToggleOnline}
          activeOpacity={0.8}
        >
          <AppText style={styles.toggleButtonText}>
            {isOnline ? t('dashboardGoOffline') : t('dashboardGoOnline')}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 4. STYLESHEET
const stylesSheet = (theme: ITheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.background.app,
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: theme.dimensions.p16,
    paddingBottom: theme.dimensions.p24,
  },
  statusCard: {
    backgroundColor: theme.color.background.surface,
    borderRadius: theme.dimensions.p12,
    padding: theme.dimensions.p16,
    marginBottom: theme.dimensions.p12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusOnline: {
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  statusOffline: {
    borderLeftWidth: 4,
    borderLeftColor: '#94a3b8',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.dimensions.p8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.dimensions.p8,
  },
  dotOnline: {
    backgroundColor: '#22c55e',
  },
  dotOffline: {
    backgroundColor: '#94a3b8',
  },
  statusText: {
    fontSize: theme.fontSize.p16,
    fontWeight: '600',
    color: theme.color.text.primary,
  },
  statsText: {
    fontSize: theme.fontSize.p14,
    color: theme.color.text.secondary,
  },
  errorCard: {
    backgroundColor: '#fee2e2',
    borderRadius: theme.dimensions.p12,
    padding: theme.dimensions.p12,
    marginBottom: theme.dimensions.p12,
  },
  errorText: {
    fontSize: theme.fontSize.p14,
    color: '#dc2626',
  },
  waitingCard: {
    backgroundColor: theme.color.background.surface,
    borderRadius: theme.dimensions.p12,
    padding: theme.dimensions.p16,
    marginBottom: theme.dimensions.p12,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: theme.fontSize.p14,
    color: theme.color.text.secondary,
    fontStyle: 'italic',
  },
  toggleButton: {
    borderRadius: theme.dimensions.p12,
    paddingVertical: theme.dimensions.p16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonOnline: {
    backgroundColor: '#22c55e',
  },
  buttonOffline: {
    backgroundColor: '#ef4444',
  },
  toggleButtonText: {
    fontSize: theme.fontSize.p16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
