import { useState, useCallback } from "react"
import type { SlideHistory } from "@/types/presentation"

export function useHistory(initialPresent: any[]) {
  const [history, setHistory] = useState<SlideHistory>({
    past: [],
    present: initialPresent,
    future: [],
  })

  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  const undo = useCallback(() => {
    const { past, present, future } = history
    if (past.length === 0) return

    const previous = past[past.length - 1]
    const newPast = past.slice(0, past.length - 1)

    setHistory({
      past: newPast,
      present: previous,
      future: [present, ...future],
    })

    // Return the previous state to update the slide
    return previous[0]
  }, [history])

  const redo = useCallback(() => {
    const { past, present, future } = history
    if (future.length === 0) return

    const next = future[0]
    const newFuture = future.slice(1)

    setHistory({
      past: [...past, present],
      present: next,
      future: newFuture,
    })

    // Return the next state to update the slide
    return next[0]
  }, [history])

  const update = useCallback((newPresent: any[]) => {
    setHistory((currentHistory) => ({
      past: [...currentHistory.past, currentHistory.present],
      present: newPresent,
      future: [],
    }))
  }, [])

  return {
    history,
    canUndo,
    canRedo,
    undo,
    redo,
    update,
  }
}

