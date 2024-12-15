import { Title } from '@components/common';
import Create from '@components/create';
import { useTranslation } from 'react-i18next';

const CreatePage = () => {
	const { t } = useTranslation('create');

	return (
		<>
			<Title text={t('title')} level={3} />
			<Create />
		</>
	);
};

export default CreatePage;
