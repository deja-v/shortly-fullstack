import { useEffect, useRef } from 'react'


export default function useEffectAfterFirstRender (effect, dependencies) {
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    effect()
  }, dependencies)
}


