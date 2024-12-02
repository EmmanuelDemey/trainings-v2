import { useParams } from "react-router-dom";
import { Person as PersonType } from "@model/person";
import { Loader, Error as ErrorComponent } from "@components/common";
import Person from "./Person";
import { useFetch } from "../../hooks";
import { API_BASE_URL } from "../../utils/env";

const PeopleContainer = () => {
  const { id } = useParams();

  const { data, loading, errorMessage } = useFetch<PersonType>(
    `${API_BASE_URL}/${id}`,
  );

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <ErrorComponent text={errorMessage} />;
  }
  return <Person person={data} />;
};

export default PeopleContainer;
