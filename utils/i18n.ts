import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import translationEn from "../locale/en.json";
import translationDe from "../locale/de.json";
import translationIt from "../locale/it.json";

const resources = {
  "en": { translation: translationEn },
  "de": { translation: translationDe },
  "it": { translation: translationIt },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem("language");

  if (!savedLanguage) {
    savedLanguage = Localization.getLocales()[0].languageTag;
  }

  await i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources,
    lng: savedLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
};

// Export the initialization promise
export const i18nInitPromise = initI18n();

export default i18n;