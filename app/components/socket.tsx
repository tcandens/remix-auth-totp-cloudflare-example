import { useState, useEffect, useRef } from 'react'
import { getSocket } from '~/lib/socket.client'
import { Button } from '~/components/ui/button'
import { H1 } from '~/components/typography'
import { toast } from 'sonner'

export default function Socket() {

  const socket = useRef(getSocket()).current
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {

    if (!socket) return

    const handle = (e: MessageEvent<any>) => {
      try {
        const data = JSON.parse(e.data)
        switch (data.type) {
          case 'time':
            setTime(data.payload)
            break
          case 'pong':
            toast.success('Pong!')
            break
          default:
            console.log('unknown event', data)
        }
      } catch (e) {
        console.error(e)
      }
    }

    socket.addEventListener('message', handle)

    return () => {

      socket.removeEventListener('message', handle)

    }
  }, [socket])

  return (
    <div className="p-3">
      <H1>Socket</H1>
      <Button
        onClick={() => {
          socket.send(JSON.stringify({type: 'ping'}))
        }}
      >
        Ping
      </Button>

      <span>{time && new Date(parseInt(time)).toLocaleTimeString()}</span>

    </div>
  )
}
