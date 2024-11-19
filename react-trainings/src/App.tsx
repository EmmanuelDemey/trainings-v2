import { Title } from "./components/common";
import PeopleFilter from "./components/people-filter";
import PeopleTable from "./components/people-table";
import { data } from "./fake-data";

function App() {
  return (
    <section className="section">
      <div className="container">
        <Title text="Hello Bulma" />
        <PeopleFilter />
        <PeopleTable data={data} />
      </div>
    </section>
  );
}

export default App;
