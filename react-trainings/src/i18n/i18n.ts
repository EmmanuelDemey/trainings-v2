import i18n from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';

i18n
	.use(initReactI18next) // passes i18n down to react-i18next
	.use(ICU)
	.init({
		resources,
		lng: 'en', // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
		// you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
		// if you're using a language detector, do not define the lng option

		interpolation: {
			escapeValue: false, // react already safes from xss
		},
		ns: ['common', 'home', 'person'], // List all namespaces
		defaultNS: 'common',
	});

export default i18n;
