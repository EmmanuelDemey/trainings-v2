import { useState } from "react";
import { Home, Person } from "@pages/index";

function App() {
  const [filter, setFilter] = useState("");
  const [routing, setRouting] = useState({ currentPage: "home", id: "" });

  const { currentPage, id } = routing;

  const onChangeFilter = (e: string) => {
    setFilter(e);
  };

  const setId = (id: string) => {
    setRouting({ currentPage: "person", id });
  };

  const backHome = () => {
    setRouting({ currentPage: "home", id: "" });
  };

  return (
    <section className="section">
      <div className="container">
        {currentPage === "home" && (
          <Home filter={filter} onChangeFilter={onChangeFilter} setId={setId} />
        )}
        {currentPage === "person" && <Person id={id} backHome={backHome} />}
      </div>
    </section>
  );
}

export default App;
