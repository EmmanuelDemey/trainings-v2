export const count = (likes: Record<string, number>) =>
	Object.values(likes).filter((v) => v === 1).length;
