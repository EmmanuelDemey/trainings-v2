import { Person } from "@model/person";
import "./table.scss";
import { useFilter, useLikes } from "../../context";
import { Button } from "../common";

type PeopleTableType = {
  data: Person[] | null;
  setId: (id: string) => void;
};

const PeopleTable = ({ data, setId }: PeopleTableType) => {
  const { filter } = useFilter();
  const { likes, setLikes } = useLikes();

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
          <th className="column-name">Likes</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map(({ name, gender, birthYear, id }) => {
          const likeValue = likes[id];
          return (
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
              <td>
                <Button
                  label="Dislike"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLikes(id, -1);
                  }}
                  disabled={likeValue === -1}
                />
                <Button
                  label="Reset"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLikes(id, 0);
                  }}
                  disabled={![-1, 1].includes(likeValue)}
                />
                <Button
                  label="Like"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLikes(id, 1);
                  }}
                  disabled={likeValue === 1}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PeopleTable;
