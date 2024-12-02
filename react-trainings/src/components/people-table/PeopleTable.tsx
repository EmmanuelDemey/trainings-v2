import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Person } from "@model/person";
import { useFilter, useLikes } from "../../context";
import { Button } from "../common";
import "./table.scss";

type PeopleTableType = {
  data: Person[] | null;
};

const PeopleTable = ({ data }: PeopleTableType) => {
  const { filter } = useFilter();
  const { likes, setLikes } = useLikes();

  const { t } = useTranslation("home");

  const navigate = useNavigate();

  if (!data) return null;

  const filteredData = data.filter(({ name }) =>
    name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <table className="table is-fullwidth">
      <thead>
        <tr>
          <th className="column-name">{t("name")}</th>
          <th className="column-name">{t("gender")}</th>
          <th className="column-name">{t("birthYear")}</th>
          <th className="column-name">{t("likes")}</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map(({ name, gender, birthYear, id }) => {
          const likeValue = likes[id];
          return (
            <tr
              key={id}
              onClick={() => {
                navigate(`/person/${id}`);
              }}
              className="table-row"
            >
              <td>{name}</td>
              <td>{gender}</td>
              <td>{birthYear}</td>
              <td>
                <Button
                  label={t("dislike")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLikes(id, -1);
                  }}
                  disabled={likeValue === -1}
                />
                <Button
                  label={t("reset")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLikes(id, 0);
                  }}
                  disabled={![-1, 1].includes(likeValue)}
                />
                <Button
                  label={t("like")}
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
