import { Form } from '@remix-run/react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '~/components/ui/button'

export default function ToggleTheme({ currentTheme }: { currentTheme: string }) {
  const opposite = currentTheme === 'light' ? 'dark' : 'light'

  return (
    <Form action="/preferences/theme" method="POST">
      <input type="hidden" name="theme" value={opposite} />
      <Button type="submit" size="icon">
        {currentTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </Button>
    </Form>
  )
}
