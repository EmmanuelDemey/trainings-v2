import { createContext, useContext } from "react";

type LikesContextType = {
  likes: Record<string, number>;
  setLikes: (k: string, v: number) => void;
};

const LikesContext = createContext<LikesContextType>({
  likes: {},
  setLikes: () => {},
});

export const LikesProvider = LikesContext.Provider;

export const useLikes = () => {
  const context = useContext(LikesContext);

  if (context === undefined) {
    throw new Error("useLikes must be used within a LikesProvider");
  }

  return context;
};
