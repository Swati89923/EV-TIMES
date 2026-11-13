import { useEffect } from 'react'

const BASE = 'EV Times'

function setMeta(attr, key, content) {
  if (!content) return
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

/**
 * Sets the tab title plus description, Open Graph / Twitter tags and (optionally)
 * JSON-LD structured data for the current page.
 */
export default function useDocumentTitle(title, description, { image, type, jsonLd } = {}) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : null

  useEffect(() => {
    const full = title ? `${title} | ${BASE}` : `${BASE} - Electric vehicle news`
    document.title = full
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title || full)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', type || 'website')
    setMeta('property', 'og:url', window.location.href)
    setMeta('name', 'twitter:title', title || full)
    setMeta('name', 'twitter:description', description)
    if (image) {
      setMeta('property', 'og:image', image)
      setMeta('name', 'twitter:image', image)
    }
    setCanonical(window.location.origin + window.location.pathname)

    let script
    if (ld) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.text = ld
      document.head.appendChild(script)
    }
    return () => script?.remove()
  }, [title, description, image, type, ld])
}
