import { API_BASE_URL } from "@utils/env";

export const getPersons = () => fetch(`${API_BASE_URL}`);

export const getPerson = (id: string) => fetch(`${API_BASE_URL}/${id}`);
