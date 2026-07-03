'use client'

import { useEffect, useState, useCallback } from 'react'
import type { SectionId } from '@/types'

export function useActiveSection(sectionIds: SectionId[]): SectionId {
  const [activeSection, setActiveSection] = useState<SectionId>(sectionIds[0])

  const updateActiveSection = useCallback(() => {
    // If scrolled to the bottom, activate the last section
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50

    if (atBottom) {
      setActiveSection(sectionIds[sectionIds.length - 1])
      return
    }

    // Otherwise, find the last section whose top has scrolled past the trigger line
    const triggerOffset = 100
    let current: SectionId | null = null

    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (el) {
        const top = el.getBoundingClientRect().top
        if (top <= triggerOffset) {
          current = id
        }
      }
    }

    if (current) {
      setActiveSection(current)
    }
  }, [sectionIds])

  useEffect(() => {
    // Update on scroll with passive listener for performance
    window.addEventListener('scroll', updateActiveSection, { passive: true })

    // Initial state depends on scroll position, which is only readable after mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateActiveSection()

    return () => window.removeEventListener('scroll', updateActiveSection)
  }, [updateActiveSection])

  return activeSection
}