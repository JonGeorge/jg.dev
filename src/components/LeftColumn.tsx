'use client'

import { NavLink } from '@/components/NavLink'
import { SocialIcons } from '@/components/SocialIcons'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ReactNode } from 'react'
// import {Logo, Logomark} from "@/components/Logo";

interface LeftColumnProps {
  activeSection: string
  photo?: ReactNode
}

const NAV_ITEMS = [
  { id: 'updates', label: 'Updates' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'writing', label: 'Writing' },
] as const

export function LeftColumn({ activeSection, photo }: LeftColumnProps) {
  return (
    <aside className="md:sticky md:top-0 md:h-screen md:w-[45%] lg:w-[40%] md:flex md:flex-col md:justify-between md:py-24 px-6 pt-16 pb-8 md:px-0">
      <div>
      {/*  <div className={"w-9 h-auto m-auto mb-8"}>*/}
      {/*    <Logo className=""/>*/}
      {/*</div>*/}

      {photo && (
          <div className="mb-8 justify-items-center">
            {photo}
          </div>
        )}

        <h1 className="font-serif text-center md:text-left text-4xl lg:text-5xl font-bold text-(--color-text-primary) mb-3">
          Jon George
        </h1>

        <p className="font-sans text-center md:text-left text-lg text-(--color-text-muted) mb-8 leading-relaxed">
          Engineering leader &amp; software architect. Currently building{' '}
          <a
            href="https://explodex.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-(--color-accent) hover:text-(--color-accent-hover) transition-colors"
          >
            Explodex
          </a>
          {' '}– AI ordnance identification — and{' '}
          <a
            href="https://softwaredb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-(--color-accent) hover:text-(--color-accent-hover) transition-colors"
          >
            SoftwareDB
          </a>
          .
        </p>

        <nav className="hidden md:flex flex-col gap-4" aria-label="In-page navigation">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.id}
              href={`#${item.id}`}
              isActive={activeSection === item.id}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4 mt-8 justify-center md:justify-start">
        <SocialIcons tooltipPosition="above" />
        <ThemeToggle className="ml-1 sm:ml-9" />
      </div>
    </aside>
  )
}
