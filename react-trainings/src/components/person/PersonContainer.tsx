import { useState, useEffect } from "react";
import { Person as PersonType } from "@model/person";
import { Loader, Error as ErrorComponent } from "@components/common";
import Person from "./Person";
import { getPerson } from "../../api/persons";

type PersonContainerType = {
  id: string;
  backHome: () => void;
};

const PeopleContainer = ({ id, backHome }: PersonContainerType) => {
  const [data, setData] = useState<PersonType | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getPerson(id)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(`API returns: ${res.status}`);
      })
      .then((json) => {
        setData(json as PersonType);
        setLoading(false);
      })
      .catch((e) => {
        setErrorMessage(e.message);
        setLoading(false);
      });
  }, [id]);
  console.log(errorMessage);
  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <ErrorComponent text={errorMessage} />;
  }
  return <Person person={data} backHome={backHome} />;
};

export default PeopleContainer;
