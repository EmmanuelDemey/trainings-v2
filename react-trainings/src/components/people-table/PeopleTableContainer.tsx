import { useQuery } from "@tanstack/react-query";
import { Person } from "@model/person";
import { Loader, Error as ErrorComponent } from "@components/common";
import PeopleTable from "./PeopleTable";
import { API_BASE_URL } from "../../utils/env";

const PeopleTableContainer = () => {
  const { data, isPending, error } = useQuery<Person[]>({
    queryKey: ["people"],
    queryFn: () => fetch(API_BASE_URL).then((r) => r.json()),
    refetchInterval: 30 * 1000,
    staleTime: 10 * 1000,
  });

  if (isPending) {
    return <Loader />;
  }

  if (error) {
    return <ErrorComponent text={error?.message} />;
  }

  return <PeopleTable data={data} />;
};

export default PeopleTableContainer;
