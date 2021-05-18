import { useCallback, useState } from 'react'

export function useToggle(initialState = false) {
  // Initialize the state
  const [stateValue, setStateValue] = useState(initialState)

  // Define and memorize toggler function in case we pass down the comopnent,
  // This function change the boolean value to it's opposite value
  const toggle = useCallback(() => setStateValue((state) => !state), [])

  return [stateValue, toggle]
}
