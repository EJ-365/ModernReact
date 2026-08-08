import { useEffect, useState } from "react";

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    async function loadData() {
      if (!url) {
        setData(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const json = await res.json();
        if (!ignore) {
          setData(json);
        }
      } catch (err) {
        if (ignore || (err instanceof Error && err.name === "AbortError")) {
          return;
        }
        setData(null);
        setError(err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [url]);

  return { data, loading, error };
}

export default useFetch;
