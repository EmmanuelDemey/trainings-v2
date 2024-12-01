import { Person as PersonType } from "@model/person";
import { Loader, Error as ErrorComponent } from "@components/common";
import PeopleTable from "./PeopleTable";
import { useFetch } from "../../hooks";
import { API_BASE_URL } from "../../utils/env";

type PeopleContainerType = {
  setId: (id: string) => void;
};

const PeopleTableContainer = ({ setId }: PeopleContainerType) => {
  const { data, loading, errorMessage } = useFetch<PersonType[]>(API_BASE_URL);

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <ErrorComponent text={errorMessage} />;
  }

  return <PeopleTable data={data} setId={setId} />;
};

export default PeopleTableContainer;
