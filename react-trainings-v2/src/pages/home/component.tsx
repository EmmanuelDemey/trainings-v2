import { useState, useEffect, FC } from 'react';
import { Loader } from 'src/common';
import { useTranslation } from 'react-i18next';
import PeopleFilter from './PeopleFilter';
import PeopleTable from './PeopleTable';
import { useFetch } from 'src/hooks/fetch';
import { count, getEnv } from 'src/utils';
import { useRecoilState } from 'recoil';
import { likeState, initLikesState } from 'src/store';

export type Person = {
	name: string;
	height?: string;
	mass?: string;
	hair_color?: string;
	skin_color?: string;
	eye_color?: string;
	birth_year: string;
	gender: string;
	homeworld?: string;
	films?: string[];
	species?: string[];
	vehicles?: string[];
	starships?: string[];
	created?: string;
	edited?: string;
	url?: string;
};

export type People = Array<Person>;

const HomePage: FC = () => {
	const { t } = useTranslation();
	const [filter, setFilter] = useState<string>('');
	// old context implem for initialLikes was buggy because of unmount when route change
	const [initialLikes, setInitialLikes] = useRecoilState(initLikesState);
	const [likes, setLikes] = useRecoilState(likeState);
	const { data, loading, error } = useFetch(
		`${getEnv('API_BASE_URL')}/?search=${filter}`
	);

	useEffect(() => {
		if (!initialLikes) {
			const init = data.reduce(
				(acc: Record<string, number>, { name }: { name: string }) => ({
					...acc,
					[name]: 0,
				}),
				{}
			);
			setLikes(init);
			setInitialLikes(true);
		}
	}, [data, initialLikes, setLikes, setInitialLikes]);

	if (error) return <div>{error}</div>;

	const likeNb = count(likes);

	return (
		<section className="section">
			<div className="container">
				<h1 className="title">Hello World</h1>
				<h2>{t('Count', { likeNb })}</h2>
				<PeopleFilter value={filter} handleChange={setFilter} />
				{loading ? <Loader /> : <PeopleTable people={data} />}
			</div>
		</section>
	);
};

export default HomePage;
