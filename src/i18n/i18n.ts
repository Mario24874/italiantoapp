import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import it from './locales/it.json';

const i18n = new I18n({
  it,
});

i18n.defaultLocale = 'it';
i18n.locale = 'it';
i18n.enableFallback = true;

export default i18n;