import { useState } from "react";
import { FilterProvider, LikesProvider } from "./context";
import { Home, Person } from "@pages/index";

function App() {
  const [likes, setLikes] = useState({});
  const [filter, setFilter] = useState("");
  const [routing, setRouting] = useState({ currentPage: "home", id: "" });

  const { currentPage, id } = routing;

  const setId = (id: string) => {
    setRouting({ currentPage: "person", id });
  };

  const backHome = () => {
    setRouting({ currentPage: "home", id: "" });
  };

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
          <FilterProvider value={{ filter, setFilter: updateFilter }}>
            {currentPage === "home" && <Home setId={setId} />}
          </FilterProvider>
          {currentPage === "person" && <Person id={id} backHome={backHome} />}
        </div>
      </section>
    </LikesProvider>
  );
}

export default App;
