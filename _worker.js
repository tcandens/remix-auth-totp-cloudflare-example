import * as ws from './functions/ws'
import * as path from './functions/[[path]]'
import cron from './functions/cron'

export default {
  async scheduled(request, evt, ctx) {
    return cron.scheduled(request, evt, ctx)
  },
  fetch(request, env, ctx) {
    if (request.url.includes('/ws')) {
      return ws.onRequest({ request, env, ctx })
    }

    if (env.ENVIRONMENT === 'development') {
      return path.onRequest({ request, env, ctx })
    }
    return env.ASSETS.fetch(request)
  }
}
