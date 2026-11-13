import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAuthConfig } from '../api/auth'
import { errorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
let scriptPromise

/** Loads Google Identity Services once, and only when an auth page needs it. */
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = SCRIPT_SRC
      s.async = true
      s.defer = true
      s.onload = resolve
      s.onerror = () => {
        scriptPromise = undefined
        reject(new Error('Google script failed to load'))
      }
      document.head.appendChild(s)
    })
  }
  return scriptPromise
}

/**
 * "Continue with Google". Renders nothing when the backend has no client id
 * configured or when Google cannot be reached, so the email form stays the only option.
 */
export default function GoogleButton({ onSuccess, onError, onBusy }) {
  const { data: config } = useQuery({ queryKey: ['auth-config'], queryFn: getAuthConfig, staleTime: Infinity, retry: 0 })
  const clientId = config?.googleClientId
  const { googleLogin } = useAuth()
  const { dark } = useTheme()
  const holder = useRef(null)
  const [ready, setReady] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const handlers = useRef({ onSuccess, onError, onBusy })
  useEffect(() => {
    handlers.current = { onSuccess, onError, onBusy }
  })

  useEffect(() => {
    if (!clientId || !holder.current) return undefined
    let cancelled = false
    const el = holder.current

    loadGoogleScript()
      .then(() => {
        if (cancelled) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          auto_select: false,
          callback: async ({ credential }) => {
            handlers.current.onBusy?.(true)
            try {
              await googleLogin(credential)
              handlers.current.onSuccess?.()
            } catch (e) {
              const status = e?.response?.status
              handlers.current.onError?.(
                status === 503
                  ? 'Google sign-in is not available right now. Please use your email instead.'
                  : errorMessage(e, 'Google sign-in failed. Please try again.'),
              )
            } finally {
              handlers.current.onBusy?.(false)
            }
          },
        })
        el.innerHTML = ''
        window.google.accounts.id.renderButton(el, {
          type: 'standard',
          theme: dark ? 'filled_black' : 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'center',
          width: Math.min(Math.max(el.clientWidth, 200), 400),
        })
        setReady(true)
      })
      .catch(() => !cancelled && setUnavailable(true))

    return () => {
      cancelled = true
    }
  }, [clientId, dark, googleLogin])

  if (!clientId || unavailable) return null
  return (
    <div className="mb-5">
      <div ref={holder} className={`flex min-h-[44px] w-full justify-center ${ready ? '' : 'shimmer rounded'}`} aria-label="Continue with Google" />
      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-neutral-500" role="separator">
        <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        or continue with email
        <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  )
}
