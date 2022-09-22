import { Exception } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Config from '@ioc:Adonis/Core/Config'

import { httpis, RequestLike, verifyContentDigest } from 'http-message-signatures'
import { verify, KeyLike } from 'crypto'
import { importJWK, JWK } from 'jose'

export type GnapSignatureValidationConfig = {

}

// Verify the signature on a request
export default class GnapSignatureValidation {
    public async handle(ctx: HttpContextContract, next: () => Promise<void>, configuration: string = 'default') {

        const config = Config.get(`gnap.middleware.signature.${configuration}`) as GnapSignatureValidationConfig
        if (!config) {
            // TODO - Setup Config for middleware
        }


    }
}


