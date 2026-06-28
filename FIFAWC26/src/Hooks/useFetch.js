import { useEffect, useState } from "react";

function useFetch(url) {
  const [state, setState] = useState({
    url,
    data: null,
    loading: Boolean(url),
    error: null,
  });

  useEffect(() => {
    if (!url) {
      return;
    }

    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        return res.json();
      })
      .then((data) => {
        setState({ url, data, loading: false, error: null });
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          return;
        }

        setState({
          url,
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        });
      });

    return () => controller.abort();
  }, [url]);

  const isStale = state.url !== url;

  return {
    data: isStale ? null : state.data,
    loading: Boolean(url) && (isStale || state.loading),
    error: isStale ? null : state.error,
  };
}

export default useFetch;
