import { useState, useEffect, useRef } from 'react'
import { getSocket } from '~/lib/socket.client'
import { Button } from '~/components/ui/button'
import { H1 } from '~/components/typography'

export default function Socket() {

  const socket = useRef(getSocket()).current
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    socket.addEventListener('message', (e) => {
      setTime(e.data)
    })
  }, [])

  return (
    <div>
      <H1>Socket</H1>
      <Button
        onClick={() => {
          socket.send('ping')
        }}
      >
        Ping
      </Button>

      <span>{time && new Date(parseInt(time)).toLocaleTimeString()}</span>

    </div>
  )
}
