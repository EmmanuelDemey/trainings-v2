import { Person as PersonType } from "@model/person";
import { Loader, Error as ErrorComponent } from "@components/common";
import PeopleTable from "./PeopleTable";
import { useFetch } from "../../hooks";
import { API_BASE_URL } from "../../utils/env";

type PeopleContainerType = {
  setId: () => void;
  filter: string;
};

const PeopleTableContainer = ({ setId, filter }: PeopleContainerType) => {
  const { data, loading, errorMessage } = useFetch<PersonType[]>(API_BASE_URL);

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <ErrorComponent text={errorMessage} />;
  }

  return <PeopleTable data={data} filter={filter} setId={setId} />;
};

export default PeopleTableContainer;
