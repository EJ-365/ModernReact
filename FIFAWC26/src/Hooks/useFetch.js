import { useEffect, useState } from "react";
function useFetch(url){
    const[data, setData] = useState(null);
    const[loading, setLoading] = useState(true);
    const[error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        setError(null);

        fetch(url, { signal: controller.signal })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Request failed with status ${res.status}`);
            }

            return res.json();
        })
        .then(data => {
            setData(data);
        })
        .catch(err => {
            if (err.name !== "AbortError") {
                setError(err);
            }
        })
        .finally(() => {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        });

        return () => controller.abort();

    }, [url])

    return {data, loading, error}
}
export default useFetch;