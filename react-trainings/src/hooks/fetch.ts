import { useState, useEffect } from "react";

type useFetchType<T> = {
  data: T | null;
  loading: boolean;
  errorMessage: string;
};

export const useFetch = <T>(url: string): useFetchType<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch(url)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(`API returns: ${res.status}`);
      })
      .then((json) => {
        setData(json as T);
        setLoading(false);
      })
      .catch((e) => {
        setErrorMessage(e.message);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, errorMessage };
};
