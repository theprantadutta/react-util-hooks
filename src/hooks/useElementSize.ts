import { RefObject, useCallback, useEffect, useRef, useState } from 'react'

interface Size {
  width: number
  height: number
}

function useEventListener<T extends HTMLElement = HTMLDivElement>(
  eventName: keyof WindowEventMap,
  handler: (event: Event) => void,
  element?: RefObject<T>
) {
  // Create a ref that stores handler
  const savedHandler = useRef<(event: Event) => void>()

  useEffect(() => {
    // Define the listening target
    const targetElement: T | Window = element?.current || window
    if (!(targetElement && targetElement.addEventListener)) {
      return
    }

    // Update saved handler if necessary
    if (savedHandler.current !== handler) {
      savedHandler.current = handler
    }

    // Create event listener that calls handler function stored in ref
    const eventListener = (event: Event) => {
      // eslint-disable-next-line no-extra-boolean-cast
      if (!!savedHandler?.current) {
        savedHandler.current(event)
      }
    }

    targetElement.addEventListener(eventName, eventListener)

    // Remove event listener on cleanup
    return () => {
      targetElement.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element, handler])
}

export function useElementSize<T extends HTMLElement = HTMLDivElement>(elementRef: RefObject<T>): Size {
  const [size, setSize] = useState<Size>({
    width: 0,
    height: 0
  })

  // Prevent too many rendering using useCallback
  const updateSize = useCallback(() => {
    const node = elementRef?.current
    if (node) {
      setSize({
        width: node.offsetWidth || 0,
        height: node.offsetHeight || 0
      })
    }
  }, [elementRef])

  // Initial size on mount
  useEffect(() => {
    updateSize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEventListener('resize', updateSize)

  return size
}
