import { Exception } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Config from '@ioc:Adonis/Core/Config'
import Client from '../Models/Client'

type Method = 'token' | 'body'

export type GnapIdentifyClientConfig = (GnapIdentifyClientByTokenConfig | GnapIdentifyClientByIdConfig) & {
  method: Method
}

type GnapIdentifyClientByIdConfig = {
  method: 'body'
}

type GnapIdentifyClientByTokenConfig = {
  method: 'token'
  dbTokenColumnName: string
}

/**
 * This middleware identifies the calling client per the methods available in GNAP.
 * 
 * There are two ways to identify the client:
 *  1. Parse the GNAP token from the Authorization header and lookup the associated request (continue or interact finish).
 *  2. Parse the client identifier from the body of the request
 * 
 * Once the client has been identified, load the clients known keys from the DB and put them into the context to be used for authentication later
 * 
 * If this is a new client, fetch the client's keys and load these into the context.
 * 
 * TODO - Once we've authenticated the client we should write the keys to the DB or a cache
 * 
 */
export default class GnapIdentifyClient {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>, configuration: string) {

    const config = Config.get(`gnap.middleware.client.${configuration}`) as GnapIdentifyClientConfig

    if(!config) {
      throw new Error(`Unable to load middleware config: 'gnap.middleware.client.${configuration}`)
    }

    switch (config.method) {
      case 'token':
        const token = getGnapToken(ctx)
        if (!token) {
          // TODO - use the right error type
          throw new Error('No token')
        }

        ctx.client = await Client.query()
          .preload('keys')
          .preload('grants')
          .whereHas('grants', (grantsQuery) => {
            grantsQuery
              .where(config.dbTokenColumnName, token)
          })
          .first()
        break;

      case 'body':
        const url = ctx.request.input('client')

        if (typeof url !== 'string') {
          throw new Exception('Invalid body')
        }

        // TODO - Validate the value is a URL

        let client = await Client.query()
          .preload('keys')
          .where('url', url)
          .first()

        if (!client) {
          // New client - fetch keys and put into the DB



          /* TODO - DDoS vector here.
            We are putting a value directly in the DB from a query.
            We need a way to do this more carefully.
          */
          client = await Client.create({ url })
        }

        ctx.client = client
        break;

      default:

        break;
    }

    await next()
  }
}

/**
* Returns the GNAP token rom the Authorization header
*/
export function getGnapToken({ request }: HttpContextContract): string | undefined {
  /**
   * Ensure the "Authorization" header value exists
   */
  const token = request.header('Authorization')
  if (!token) {
    return
  }

  /**
   * Ensure that token has minimum of two parts and the first
   * part is a constant string named `bearer`
   */
  const [type, value] = token.split(' ')
  if (!type || type.toLowerCase() !== 'gnap' || !value) {
    return
  }
  return value
}
