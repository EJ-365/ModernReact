import { useEffect, useState } from "react";

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    if (!url) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        return res.json();
      })
      .then((data) => {
        if (!isCurrent) return;
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [url]);

  return { data, loading, error };
}

export default useFetch;
