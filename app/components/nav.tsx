import { NavLink as RemixNavLink, type NavLinkProps } from '@remix-run/react'
import ThemeToggle from './theme-toggle'
import { cn } from '~/lib/utils'

function NavLink(props: NavLinkProps) {
  return <RemixNavLink {...props} className={cn('p-3 font-semibold', props.className)} />
}

export function Nav({ currentTheme, isAuthenticated }: { currentTheme: string, isAuthenticated: boolean }) {

  return (
    <nav className="bg-rose-600 text-rose-50 flex flex-row items-center justify-between">
      <ul className="flex flex-row gap-3 p-3">
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        {isAuthenticated ? (
          <>
            <li>
              <NavLink to="/account">Account</NavLink>
            </li>
            <li>
              <NavLink to="/committee">Committees</NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/login">Login</NavLink>
            </li>
          </>
        )}
      </ul>

      <div className="px-3">
        <ThemeToggle currentTheme={currentTheme} />
      </div>

    </nav>
  )
}
