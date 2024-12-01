import { createContext, useContext } from "react";

type FilterContextType = {
  filter: string;
  setFilter: (e: string) => void;
};

export const FilterContext = createContext<FilterContextType>({
  filter: "",
  setFilter: () => {},
});

export const FilterProvider = FilterContext.Provider;

export const useFilter = () => {
  const context = useContext(FilterContext);

  if (context === undefined) {
    throw new Error("useFilter must be used within a FilterProvider");
  }

  return context;
};
