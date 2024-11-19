import { useState } from "react";
import { data } from "./fake-data";
import { Home, Person } from "./pages";

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

  const filteredData = data.filter(({ name }) =>
    name.toLowerCase().includes(filter.toLowerCase()),
  );

  const person = data.find(({ url }) => url === id);

  return (
    <section className="section">
      <div className="container">
        {currentPage === "home" && (
          <Home
            filter={filter}
            onChangeFilter={onChangeFilter}
            data={filteredData}
            setId={setId}
          />
        )}
        {currentPage === "person" && (
          <Person person={person} backHome={backHome} />
        )}
      </div>
    </section>
  );
}

export default App;
