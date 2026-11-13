import { useSyncExternalStore } from 'react'

// One shared timer so every relative timestamp on the page refreshes together, once a minute.
let now = Date.now()
const listeners = new Set()
let timer = null

function tick() {
  now = Date.now()
  listeners.forEach((l) => l())
}

function subscribe(listener) {
  listeners.add(listener)
  if (!timer) timer = setInterval(tick, 60000)
  return () => {
    listeners.delete(listener)
    if (!listeners.size && timer) {
      clearInterval(timer)
      timer = null
    }
  }
}

export default function useNow() {
  return useSyncExternalStore(subscribe, () => now)
}
