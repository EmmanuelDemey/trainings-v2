import { useState, useEffect } from "react";
import { Person as PersonType } from "@model/person";
import { Loader, Error as ErrorComponent } from "@components/common";
import PeopleTable from "./PeopleTable";
import { getPersons } from "../../api/persons";

type PeopleContainerType = {
  setId: () => void;
  filter: string;
};

const PeopleTableContainer = ({ setId, filter }: PeopleContainerType) => {
  const [data, setData] = useState<PersonType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getPersons()
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(`API returns: ${res.status}`);
      })
      .then((json) => {
        setData(json as PersonType[]);
        setLoading(false);
      })
      .catch((e) => {
        setErrorMessage(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <ErrorComponent text={errorMessage} />;
  }

  return <PeopleTable data={data} filter={filter} setId={setId} />;
};

export default PeopleTableContainer;
