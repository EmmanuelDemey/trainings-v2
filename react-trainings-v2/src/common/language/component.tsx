import { useTranslation } from 'react-i18next';

const Language = () => {
	const { i18n } = useTranslation();
	return (
		<div className="is-pulled-right">
			<button
				type="button"
				className="button"
				onClick={() => {
					i18n.changeLanguage('fr');
				}}
			>
				FR
			</button>
			<button
				type="button"
				className="button"
				onClick={() => {
					i18n.changeLanguage('en');
				}}
			>
				EN
			</button>
		</div>
	);
};

export default Language;
