import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import type { HttpException } from ''
import Grant from '../../../Models/Grant'
import GnapException from '../../../Exceptions/GnapException'

// TokenController sits behind the '/gnap' route to handle the implementation of the GNAP protocol
export default class TokenController {

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-rotating-the-access-token
  public async rotateToken({}: HttpContextContract) {}

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-revoking-the-access-token
  public async revokeToken({}: HttpContextContract) {}

}
