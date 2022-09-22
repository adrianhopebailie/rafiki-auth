import { Exception } from '@adonisjs/core/build/standalone'
import { ErrorCode } from '../../providers/Gnap/types'

export default class GnapException extends Exception {
    constructor(message: string, public errorCode: ErrorCode, httpResponseCode?: number) {
        super(message, httpResponseCode || httpResponseFromErrorCode(errorCode), 'E_GNAP_EXCEPTION')
    }

}

// TODO - Map GNAP error codes to appropriate HTTP error codes
function httpResponseFromErrorCode(gnapErrorCode: ErrorCode): number {
    switch(gnapErrorCode) {
        default:
            return 400
    }
}

export function isGnapException(error: any): error is GnapException {
    return (typeof error === 'object') &&
    ('name' in error && typeof error.name === 'string') &&
    ('message' in error && typeof error.message === 'string') &&
    ('status' in error && typeof error.status === 'number') &&
    ('errorCode' in error && typeof error.errorCode === 'string')
}