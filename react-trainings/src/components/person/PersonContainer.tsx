import { Person as PersonType } from "@model/person";
import { Loader, Error as ErrorComponent } from "@components/common";
import Person from "./Person";
import { useFetch } from "../../hooks";
import { API_BASE_URL } from "../../utils/env";

type PersonContainerType = {
  id: string;
  backHome: () => void;
};

const PeopleContainer = ({ id, backHome }: PersonContainerType) => {
  const { data, loading, errorMessage } = useFetch<PersonType>(
    `${API_BASE_URL}/${id}`,
  );

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <ErrorComponent text={errorMessage} />;
  }
  return <Person person={data} backHome={backHome} />;
};

export default PeopleContainer;
