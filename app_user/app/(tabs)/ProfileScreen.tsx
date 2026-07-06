// 1. IMPORTS
import { useUpdateProfile } from 'api/hooks/useUser';
import { useLogout } from 'api/hooks/useAuth';
import { AppButton } from 'components/button/AppButton';
import { AppText } from 'components/text/AppText';
import { AppTextInput } from 'components/input/TextInput';
import { RenderImage } from 'components/image/RenderImage';
import { LANGUAGES, ModeTheme } from 'constants/enum';
import { router } from 'expo-router';
import { changeLanguage, getString } from 'localization/index';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ITheme, useAppTheme } from 'theme/index';
import ZustandPersist from 'zustand/persist';
import { useShallow } from 'zustand/react/shallow';

// 2. COMPONENT FUNCTION
export default function ProfileScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => stylesSheet(theme), [theme]);
  const { i18n } = useTranslation();

  const user = ZustandPersist(useShallow((state) => state.user));
  const themeApp = ZustandPersist(useShallow((state) => state.ThemeApp));
  const language = ZustandPersist(useShallow((state) => state.Localization));

  const updateProfile = useUpdateProfile();
  const logout = useLogout();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [error, setError] = useState('');

  const displayName = user?.name || user?.phone || '';
  const isDark = themeApp !== ModeTheme.Light;
  const isVietnamese = language === LANGUAGES.VIETNAMESE;

  const handleStartEdit = () => {
    setName(user?.name ?? '');
    setError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setError('');
    setIsEditing(false);
  };

  const handleSave = () => {
    updateProfile.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setError('');
          setIsEditing(false);
        },
        onError: () => {
          setError(getString('profileUpdateError'));
        },
      }
    );
  };

  const handleToggleTheme = (next: boolean) => {
    theme.changeTheme(next ? ModeTheme.Dark : ModeTheme.Light);
  };

  const handleToggleLanguage = (next: boolean) => {
    // i18n.changeLanguage keeps react-i18next in sync; changeLanguage persists it.
    const target = next ? LANGUAGES.VIETNAMESE : LANGUAGES.ENGLISH;
    changeLanguage(target);
    i18n.changeLanguage(target);
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        router.replace('/SigninStack/SigninScreen');
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AppText style={styles.headerTitle}>{getString('profileTitle')}</AppText>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={styles.card}>
          {/* Persisted user has no avatar field; RenderImage falls back to the default image. */}
          <RenderImage style={styles.avatar} contentFit="cover" />
          <View style={styles.identity}>
            <AppText style={styles.name}>{displayName}</AppText>
            {!!user?.phone && (
              <AppText style={styles.phone}>{user.phone}</AppText>
            )}
          </View>
        </View>

        {/* Edit name section */}
        {isEditing ? (
          <View style={styles.section}>
            <AppText style={styles.label}>
              {getString('profileNameLabel')}
            </AppText>
            <AppTextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) setError('');
              }}
              placeholder={getString('profileNamePlaceholder')}
              autoFocus
            />
            {!!error && <AppText style={styles.errorText}>{error}</AppText>}
            <View style={styles.editActions}>
              <AppButton
                text={getString('profileCancel')}
                onPress={handleCancelEdit}
                disabled={updateProfile.isPending}
                style={styles.cancelButton}
                textStyle={styles.cancelButtonText}
              />
              <AppButton
                text={getString('profileSave')}
                onPress={handleSave}
                disabled={updateProfile.isPending}
                style={styles.saveButton}
              />
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.rowLabels}>
                <AppText style={styles.label}>
                  {getString('profileNameLabel')}
                </AppText>
                <AppText style={styles.value}>{displayName}</AppText>
              </View>
              <AppText style={styles.editLink} onPress={handleStartEdit}>
                {getString('profileEdit')}
              </AppText>
            </View>
            {!!user?.email && (
              <View style={styles.rowLabels}>
                <AppText style={styles.label}>
                  {getString('profileEmailLabel')}
                </AppText>
                <AppText style={styles.value}>{user.email}</AppText>
              </View>
            )}
          </View>
        )}

        {/* Settings section */}
        <AppText style={styles.sectionTitle}>
          {getString('profileSettingsTitle')}
        </AppText>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <AppText style={styles.settingLabel}>
              {getString('profileThemeLabel')}
            </AppText>
            <Switch
              value={isDark}
              onValueChange={handleToggleTheme}
              trackColor={{
                false: theme.color.border.default,
                true: theme.color.primary.actionGreen,
              }}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <AppText style={styles.settingLabel}>
              {getString('profileLanguageLabel')}
            </AppText>
            <View style={styles.langToggle}>
              <AppText
                style={[
                  styles.langOption,
                  !isVietnamese && styles.langOptionActive,
                ]}
                onPress={() => handleToggleLanguage(false)}
              >
                {getString('en')}
              </AppText>
              <AppText style={styles.langSeparator}>/</AppText>
              <AppText
                style={[
                  styles.langOption,
                  isVietnamese && styles.langOptionActive,
                ]}
                onPress={() => handleToggleLanguage(true)}
              >
                {getString('vi')}
              </AppText>
            </View>
          </View>
        </View>

        {/* Logout */}
        <AppButton
          text={getString('profileLogout')}
          onPress={handleLogout}
          disabled={logout.isPending}
          style={styles.logoutButton}
          textStyle={styles.logoutButtonText}
        />
      </ScrollView>
    </View>
  );
}

// 3. STYLESHEET
const stylesSheet = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.color.background.app,
    },
    header: {
      paddingHorizontal: theme.dimensions.p16,
      paddingVertical: theme.dimensions.p12,
    },
    headerTitle: {
      fontSize: theme.fontSize.p24,
      fontWeight: '700',
      color: theme.color.text.primary,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.dimensions.p16,
      paddingBottom: theme.dimensions.p24,
      gap: theme.dimensions.p16,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.dimensions.p16,
      backgroundColor: theme.color.card.bg,
      borderRadius: theme.dimensions.p12,
      borderWidth: 1,
      borderColor: theme.color.card.border,
      padding: theme.dimensions.p16,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.color.background.surfaceAlt,
    },
    identity: {
      flex: 1,
      gap: theme.dimensions.p4,
    },
    name: {
      fontSize: theme.fontSize.p20,
      fontWeight: '700',
      color: theme.color.text.primary,
    },
    phone: {
      fontSize: theme.fontSize.p14,
      color: theme.color.text.secondary,
    },
    section: {
      backgroundColor: theme.color.card.bg,
      borderRadius: theme.dimensions.p12,
      borderWidth: 1,
      borderColor: theme.color.card.border,
      padding: theme.dimensions.p16,
      gap: theme.dimensions.p12,
    },
    sectionTitle: {
      fontSize: theme.fontSize.p14,
      fontWeight: '600',
      color: theme.color.text.secondary,
      marginTop: theme.dimensions.p8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowLabels: {
      flex: 1,
      gap: theme.dimensions.p4,
    },
    label: {
      fontSize: theme.fontSize.p14,
      color: theme.color.text.secondary,
    },
    value: {
      fontSize: theme.fontSize.p16,
      color: theme.color.text.primary,
      fontWeight: '500',
    },
    editLink: {
      fontSize: theme.fontSize.p14,
      fontWeight: '600',
      color: theme.color.primary.actionGreen,
      paddingLeft: theme.dimensions.p12,
    },
    errorText: {
      color: theme.color.state.error,
      fontSize: theme.fontSize.p14,
    },
    editActions: {
      flexDirection: 'row',
      gap: theme.dimensions.p12,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: theme.color.background.surfaceAlt,
    },
    cancelButtonText: {
      color: theme.color.text.primary,
    },
    saveButton: {
      flex: 1,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 32,
    },
    settingLabel: {
      fontSize: theme.fontSize.p16,
      color: theme.color.text.primary,
    },
    divider: {
      height: 1,
      backgroundColor: theme.color.border.light,
    },
    langToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.dimensions.p8,
    },
    langOption: {
      fontSize: theme.fontSize.p16,
      color: theme.color.text.secondary,
    },
    langOptionActive: {
      color: theme.color.primary.actionGreen,
      fontWeight: '700',
    },
    langSeparator: {
      color: theme.color.text.disabled,
    },
    logoutButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.color.state.error,
      marginTop: theme.dimensions.p8,
    },
    logoutButtonText: {
      color: theme.color.state.error,
    },
  });
