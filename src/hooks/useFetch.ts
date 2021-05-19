import { useCallback, useEffect, useState } from 'react'

interface RequestProps<T> {
  url: RequestInfo
  init?: RequestInit
  processData?: (data: any) => T
}

export default function useFetch<T>({ url, init, processData }: RequestProps<T>) {
  // Response state
  const [data, setData] = useState<T>()
  const [error, setError] = useState<Error | null>(Error)
  const [loading, setLoading] = useState(false)

  // Turn objects into strings for useCallback & useEffect dependencies
  const [stringifyUrl, stringifyInit] = [JSON.stringify(url), JSON.stringify(init)]

  // If no processing function is passed just cast the object to type T
  // The callback hook ensures that the function is only created once
  // and hence the effect hook below doesn't start an infinite loop
  const processJson = useCallback(processData || ((jsonBody: any) => jsonBody as T), [])

  useEffect(() => {
    // Use AbortController API to make request abortable
    const abortController = new AbortController()
    // Define asynchronous function
    const fetchApi = async () => {
      setLoading(true)
      try {
        // Fetch data from REST API
        const response = await fetch(url, { ...(init ?? {}), signal: abortController.signal })

        if (response.status === 200) {
          // Extract json
          const rawData: any = await response.json()
          const processedData = processJson(rawData)
          setData(processedData)
        } else {
          throw Error(`Error ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        setError(error)
      }
      setLoading(false)
    }

    // Call async function
    fetchApi()

    // Abort request on unmount
    return () => abortController.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringifyUrl, stringifyInit, processJson])

  return { data, loading, error }
}
