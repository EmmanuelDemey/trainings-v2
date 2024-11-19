import { Persons } from "../../model/person";

type PeopleTableType = {
  data: Persons;
};

const PeopleTable = ({ data }: PeopleTableType) => (
  <table className="table is-fullwidth">
    <thead>
      <tr>
        <th>Nom</th>
        <th>Genre</th>
        <th>Année de naissance</th>
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
