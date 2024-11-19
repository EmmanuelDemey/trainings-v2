import { Persons } from "../../model/person";
import "./table.scss";

type PeopleTableType = {
  data: Persons;
};

const PeopleTable = ({ data }: PeopleTableType) => (
  <table className="table is-fullwidth">
    <thead>
      <tr>
        <th className="column-name">Nom</th>
        <th className="column-name">Genre</th>
        <th className="column-name">Année de naissance</th>
      </tr>
    </thead>
    <tbody>
      {data.map(({ name, gender, birth_year, url }) => (
        <tr key={url}>
          <td>{name}</td>
          <td>{gender}</td>
          <td>{birth_year}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default PeopleTable;
