import { create } from 'zustand';

type useLikesType = {
	likes: Record<string, number>;
	setLikes: (k: string, v: number) => void;
};

export const useLikes = create<useLikesType>((set) => ({
	likes: {},
	setLikes: (k: string, v: number) =>
		set((state) => ({ likes: { ...state.likes, [k]: v } })),
}));
