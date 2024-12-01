import { Person } from "@model/person";
import "./table.scss";
import { useFilter } from "../../context";

type PeopleTableType = {
  data: Person[] | null;
  setId: (id: string) => void;
};

const PeopleTable = ({ data, setId }: PeopleTableType) => {
  const { filter } = useFilter();

  if (!data) return null;

  const filteredData = data.filter(({ name }) =>
    name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <table className="table is-fullwidth">
      <thead>
        <tr>
          <th className="column-name">Nom</th>
          <th className="column-name">Genre</th>
          <th className="column-name">Année de naissance</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map(({ name, gender, birthYear, id }) => (
          <tr
            key={id}
            onClick={() => {
              setId(id);
            }}
            className="table-row"
          >
            <td>{name}</td>
            <td>{gender}</td>
            <td>{birthYear}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PeopleTable;
