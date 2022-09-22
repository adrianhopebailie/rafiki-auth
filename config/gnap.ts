import Env from '@ioc:Adonis/Core/Env'
import { GnapIdentifyClientConfig } from '../app/Middleware/GnapIdentifyClient'
import { GnapSignatureValidationConfig } from '../app/Middleware/GnapSignatureValidation'
import { StartMethod } from '../app/Services/types'
 
 /*
 |--------------------------------------------------------------------------
 | GNAP Config
 |--------------------------------------------------------------------------
 |
 | The config for GNAP middlewares etc
 |
 */
 const gnapConfig: GnapConfig = {
 
   middleware: {
    signature: {
      default: {
      }
    },
    client: {
      init: {
        method: 'body',
      },
      token: {
        method: 'token',
        dbTokenColumnName: 'continue_token',
      }
    },
   },
 }

 export const gnapGrantConfig = {
    supportedInteractMethods: Env.get('GNAP_GRANT_INTERACT_METHODS', [StartMethod.Redirect]),
    defaultWait: Env.get('GNAP_GRANT_DEFAULT_WAIT', 15)
 }

 export const gnapClientConfig = {
 }

 export default gnapConfig
 
 type GnapConfig = {
  middleware: {
    signature: {
      [config: string]: GnapSignatureValidationConfig
    },
    client: {
      [config: string]: GnapIdentifyClientConfig
    },
  }
 }