/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import { EventEmitter } from 'node:events'

export declare interface Events {
  emit(event: 'ready'): boolean

  emit(event: 'message-insert', payload: { agent: string, content: string }): boolean
  on(event: 'message-insert', listener: (payload: { agent: string, content: string }) => void): this

  emit(event: 'message-delete', payload: { id: string }): boolean
  on(event: 'message-delete', listener: (payload: { id: string }) => void): this
}

export class Events extends EventEmitter {
  constructor() {
    super()
    this.emit('ready')
  } 
}

export const events = new Events()

