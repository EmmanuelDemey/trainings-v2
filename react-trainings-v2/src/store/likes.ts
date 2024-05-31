import { atom } from 'recoil';

export const likeState = atom({
	key: 'likeState',
	default: {} as Record<string, number>,
});

export const initLikesState = atom({
	key: 'initLikesState',
	default: false as boolean,
});
