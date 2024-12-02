import { useState } from "react";
import { RouterProvider } from "react-router-dom";
import { FilterProvider, LikesProvider } from "./context";
import { router } from "./router";
import { Language } from "@components/common";
import "./i18n";

function App() {
  const [likes, setLikes] = useState({});
  const [filter, setFilter] = useState("");

  const updateFilter = (f: string) => {
    setFilter(f);
  };

  const updateLikes = (k: string, v: number) => {
    setLikes({ ...likes, [k]: v });
  };

  return (
    <LikesProvider value={{ likes, setLikes: updateLikes }}>
      <section className="section">
        <div className="container">
          <Language />
          <FilterProvider value={{ filter, setFilter: updateFilter }}>
            <RouterProvider router={router} />
          </FilterProvider>
        </div>
      </section>
    </LikesProvider>
  );
}

export default App;
