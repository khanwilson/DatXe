import { LANGUAGES } from 'constants/enum';
import i18n from 'i18next';
import { getI18n, initReactI18next } from 'react-i18next';
import ZustandPersist from 'zustand/persist';
import { useShallow } from 'zustand/react/shallow';
import { iLocalization } from './iLocalization';
import en from './resources/en';
import vi from './resources/vi';

export const fallBackLanguage = LANGUAGES.ENGLISH;

const renLanguage = (language?: LANGUAGES) => { // check language is valid ỏr not. if not, app will set fallback is EN
  switch (language) {
    case LANGUAGES.VIETNAMESE:
      return LANGUAGES.VIETNAMESE;
    case LANGUAGES.ENGLISH:
      return LANGUAGES.ENGLISH;
    default:
      return fallBackLanguage;
  }
}

export const configureLocalization = (language?: LANGUAGES) => {
  ZustandPersist.getState().save('Localization', renLanguage(language))
  return i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4',
      lng: renLanguage(language),
      fallbackLng: fallBackLanguage,

      resources: {
        en: {
          translation: en
        },
        vi: {
          translation: vi
        },
      },

      debug: false,
      cache: {
        enabled: true
      },
      interpolation: {
        escapeValue: false // not needed for react as it does escape per default to prevent xss!
      }
    });
};

export const getString = (key: keyof iLocalization, params?: any, language?: LANGUAGES): string => {
  if (getI18n()) {
    if (language) {
      return getI18n().t(key, params, { lng: renLanguage(language) });
    }
    return getI18n().t(key, params);
  }
  return '';
};

export const changeLanguage = (language?: LANGUAGES): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check if i18n is initialized
    if (!i18n.isInitialized) {
      // Initialize i18n first if not initialized
      const savedLanguage = ZustandPersist(useShallow(state => state?.Localization));
      
      configureLocalization(savedLanguage || language).then(() => {
        // After initialization, change language
        i18n.changeLanguage(renLanguage(language)).then((success: any) => {
          ZustandPersist.getState().save('Localization', renLanguage(language))
          setTimeout(() => {
            resolve('Change language success');
          }, 500);
        }).catch((error: any) => {
          reject(error.toString());
        });
      }).catch((error: any) => {
        reject(error.toString());
      });
    } else {
      // i18n is already initialized, just change language
      i18n.changeLanguage(renLanguage(language)).then((success: any) => {
        ZustandPersist.getState().save('Localization', renLanguage(language))
        setTimeout(() => {
          resolve('Change language success');
        }, 500);
      }).catch((error: any) => {
        reject(error.toString());
      });
    }
  });
};
