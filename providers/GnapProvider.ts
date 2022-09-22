import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
|
| Your application is not ready when this file is loaded by the framework.
| Hence, the top level imports relying on the IoC container will not work.
| You must import them inside the life-cycle methods defined inside
| the provider class.
|
| @example:
|
| public async ready () {
|   const Database = this.app.container.resolveBinding('Adonis/Lucid/Database')
|   const Event = this.app.container.resolveBinding('Adonis/Core/Event')
|   Event.on('db:query', Database.prettyPrint)
| }
|
*/
export default class GnapProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
    this.app.container.singleton('Gnap/GrantService', () => {
        const { gnapGrantConfig } = this.app.config.get('gnap')
        const GrantsService = require('../app/Services/GrantService').default
        return new GrantsService(gnapGrantConfig)
    })

    this.app.container.singleton('Gnap/ClientService', () => {
        const { gnapClientConfig } = this.app.config.get('gnap')
        const ClientService = require('../app/Services/ClientService').default
        return new ClientService(gnapClientConfig)
    })

  }

  public async boot() {
    // All bindings are ready, feel free to use them
    const Route = this.app.container.use('Adonis/Core/Route')
    const ClientService = this.app.container.use('Gnap/ClientService')

    Route.Route.macro('checkHttpMessageSignature', function() {

      this.middleware(async (ctx, next) => {
        const { client, request } = ctx

        ClientService.authenticateClientRequest(client, request)

        if (!client) {
            throw new Exception("Unknown client. Unable to verify signature.")
        }

        await next()
      })

      return this
    })

    Route.RouteGroup.macro('checkHttpMessageSignature', function() {
      this.middleware(async (ctx, next) => {
        if (!ctx.request.hasValidSignature()) {
          return ctx.response.badRequest('Invalid signature')
        }

        await next()
      })

      return this
    })
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
