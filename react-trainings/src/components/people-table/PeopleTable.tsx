import { IconButton } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Person } from "@model/person";
import { useLikes } from "../../context";
import { Button, Table } from "@components/common";
import "./table.scss";

type PeopleTableType = {
  data: Person[] | null;
};

const PeopleTable = ({ data }: PeopleTableType) => {
  const { likes, setLikes } = useLikes();

  const { t } = useTranslation("home");

  const navigate = useNavigate();

  if (!data) return null;

  const dataToDisplay = data.map(({ name, gender, birthYear, id }) => {
    const likeValue = likes[id];
    return {
      Name: name,
      Gender: gender,
      "Birth year": birthYear,
      Likes: (
        <>
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
        </>
      ),
      "": (
        <IconButton
          component="a"
          onClick={() => {
            navigate(`person/${id}`);
          }}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: "primary.main",
          }}
        >
          <OpenInNewIcon />
        </IconButton>
      ),
    };
  });

  return <Table data={dataToDisplay} />;
};

export default PeopleTable;
