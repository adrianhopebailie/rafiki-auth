import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Grant, { GrantState } from '../../../Models/Grant'
import GnapException from '../../../Exceptions/GnapException'
import { operations } from '../../../../contracts/open-api'
import { inject } from '@adonisjs/core/build/standalone'
import GrantService from '../../../Services/grant'
import { AccessTokenResponse, ContinueResponse, ErrorCode, GrantResponse, InteractionState, InteractResponse, StartMethod } from '../../../Services/types'
import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'


// GrantController sits behind the '/gnap' route to handle the implementation of the GNAP protocol
@inject()
export default class GrantController {

    private grantService : GrantService

    // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-requesting-access
    public async requestGrant({ client, request }: HttpContextContract) {

        if (!client) throw new GnapException('Unexpected error.', ErrorCode.InvalidClient, 500)

        // TODO - Map request types from Open API to internal static type defs
        const { access_token, interact } = request.body() as operations['post']['requestBody']['content']['application/json']
        const resp: operations['post']['responses']['200']['content']['application/json'] = {}

        const grant = await this.grantService.initializeGrantNegotiation(client, access_token.access, interact)

        await this.grantService.processGrant(grant)

        return this._grantResponse(grant)


    }

    // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-continuing-a-grant-request
    public async continueGrant({ client, request, params, response }: HttpContextContract) {

        const continueId = params.id
        if (!continueId || !client) {
            // TODO - Exception
            throw new GnapException('Missing continue ID path parameter', ErrorCode.UnknownRequest)
        }

        // TODO - Get grant by token instead
        const grant = await client.related('grants').query()
            .where('continue_id', continueId)
            .first()

        if (!grant) {
            throw new GnapException('Grant request not found.', ErrorCode.UnknownRequest)
        }

        if (await this.grantService.isTooFast(grant)) {
            throw new GnapException('Grant request continued too fast.', ErrorCode.TooFast)
        }

        const reference = request.input('interact_ref')
        if(reference) {
            await this.grantService.finishInteraction(grant, reference)
        } else if(!request.hasBody()){
            await this.grantService.poll(grant)
        } else {
            throw new GnapException('Invalid continue request received.', ErrorCode.InvalidRequest)
        }

        await this.grantService.processGrant(grant)

        return this._grantResponse(grant)
    }

    // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-modifying-an-existing-reque
    public async updateGrant({ }: HttpContextContract) { 

    }

    // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-revoking-a-grant-request
    public async revokeGrant({ }: HttpContextContract) { }


    private async _grantResponse(grant: Grant) : Promise<GrantResponse> {

        switch(grant.state) {
            case GrantState.Processing: {
                throw new Error('Unexpected state')
            }
            case GrantState.Finalized: {
                // TODO - Is this the correct response?
                return {};
            }
            case GrantState.Pending: {
                this.grantService.refreshContinueToken(grant)
                const interact = await this._interactResponse(grant)
                const continueRsp = await this._continueResponse(grant)
                return {
                    continue: continueRsp, 
                    interact
                }
            }
            case GrantState.Approved: {
                // TODO - Create access token if required
                const continueRsp = await this._continueResponse(grant)
                const access_token = await this._accessTokenResponse(grant)
                return {
                    continue: continueRsp, 
                    access_token
                }
            }
        }

    }
    
    private async _accessTokenResponse(grant: Grant): Promise<AccessTokenResponse | AccessTokenResponse[]> {
        //TODO - Construct the access token from the grant
        throw new Error('Method not implemented.')
    }

    private _continueResponse(grant: Grant): ContinueResponse {
        return {
            access_token: {
                value: grant.continueToken
            },
            uri: '', // TODO - Set appropriate URL value
            wait: 30 // TODO - Set appropriate wait value
        }
    }

    private async _interactResponse(grant: Grant): Promise<InteractResponse | undefined> {

        // TODO - Filter interactions that have expired or been approved or denied
        const interactions = await grant.related('interactions')
        .query()
        .whereNull('finishedAt')

        if(interactions.length === 0){
            return
        }
        return interactions.reduce((rsp, interaction) => {
            rsp[interaction.method] = (interaction.method === StartMethod.UserCodeUri) ?
            {
                code: interaction.code,
                uri: interaction.uri
            } :
            interaction.uri
            return rsp
        }, {} as InteractResponse)
    }

}
