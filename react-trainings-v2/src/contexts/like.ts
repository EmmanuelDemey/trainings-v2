import { createContext } from 'react';

type LikeContextType = {
	likes: Record<string, number>;
	updateLikes: (k: string, v: number) => void;
};

export const LikeContext = createContext({
	likes: {},
	updateLikes: (k: string, v: number): void => {
		console.log(`Update ${k}: ${v}`);
	},
} as LikeContextType);
