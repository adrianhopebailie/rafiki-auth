import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, hasMany, HasMany, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import GrantAccess from './GrantAccess'
import AccessToken from './AccessToken'
import Client from './Client'
import Interaction from './Interaction'
import { AccessRequest, FinishMethod, InteractRequest, StartMethod } from '../../providers/Gnap/types'

export default class Grant extends BaseModel {

    public static selfAssignPrimaryKey = true

    @beforeCreate()
    public static assignUuid(grant: Grant) {
        grant.id = uuid()
    }

    @column({ isPrimary: true })
    public id: string

    @column() // Not Nullable
    public state: GrantState

    @column() // Not Nullable - SpecificType text[]
    public supportedStartMethods: StartMethod[]

    @column() // Not Nullable - Unique
    public continueToken: string

    @column()
    public wait: number

    @column() // Not Nullable
    public finishMethod: FinishMethod

    @column() // Not Nullable
    public finishUri: string

    @column() // Not Nullable
    public finishNonce: string

    @column() // Not Nullable - Unique
    public interactNonce: string


    // Relations
    @column()
    public clientId: string

    @belongsTo(() => Client)
    public client: BelongsTo<typeof Client>

    @hasMany(() => GrantAccess, {
        serializeAs: 'access'
    })
    public accesses: HasMany<typeof GrantAccess>

    @hasMany(() => AccessToken, {
        serializeAs: null
    })
    public accessTokens: HasMany<typeof AccessToken>

    @hasMany(() => Interaction, {
        serializeAs: null
    })
    public interactions: HasMany<typeof Interaction>

    // Timestamps

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

}

// https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#section-1.5
export enum GrantState {
    /**
     * When a request for access (Section 2) is received by the AS, a new grant request is created and placed in the processing state by the AS. This state is also entered when an existing grant request is updated by the client instance and when interaction is completed. In this state, the AS processes the context of the grant request to determine whether interaction with the end user or RO is required for approval of the request. The grant request has to exit this state before a response can be returned to the client instance. If approval is required, the request moves to the pending state and the AS returns a continue response (Section 3.1) along with any appropriate interaction responses (Section 3.3). If no such approval is required, such as when the client instance is acting on its own behalf or the AS can determine that access has been fulfilled, the request moves to the approved state where access tokens for API access (Section 3.2) and subject information (Section 3.4) can be issued to the client instance. If the AS determines that no additional processing can occur (such as a timeout or an unrecoverable error), the grant request is moved to the finalized state and is terminated.
     */
    Processing = 'processing',
    /**
     * When a request needs to be approved by a RO, or interaction with the end user is required, the grant request enters a state of pending. In this state, no access tokens can be granted and no subject information can be released to the client instance. While a grant request is in this state, the AS seeks to gather the required consent and authorization (Section 4) for the requested access. A grant request in this state is always associated with a continuation access token bound to the client instance's key. If no interaction finish method (Section 2.5.2) is associated with this request, the client instance can send a polling continue request (Section 5.2) to the AS. This returns a continue response (Section 3.1) while the grant request remains in this state, allowing the client instance to continue to check the state of the pending grant request. If an interaction finish method (Section 2.5.2) is specified in the grant request, the client instance can continue the request after interaction (Section 5.1) to the AS to move this request to the processing state to be re-evaluated by the AS. Note that this occurs whether the grant request has been approved or denied by the RO, since the AS needs to take into account the full context of the request before determining the next step for the grant request. When other information is made available in the context of the grant request, such as through the asynchronous actions of the RO, the AS moves this request to the processing state to be re-evaluated. If the AS determines that no additional interaction can occur, such as all the interaction methods have timed out or a revocation request (Section 5.4) is received from the client instance, the grant request can be moved to the finalized state.
     */
    Pending = 'pending',
    /**
     * When a request has been approved by an RO and no further interaction with the end user is required, the grant request enters a state of approved. In this state, responses to the client instance can include access tokens for API access (Section 3.2) and subject information (Section 3.4). If continuation and updates are allowed for this grant request, the AS can include the contination response (Section 3.1). In this state, post-interaction continuation requests (Section 5.1) are not allowed, since all interaction is assumed to have been completed. If the client instance sends a polling continue request (Section 5.2) while the request is in this state, new access tokens (Section 3.2) can be issued in the response. Note that this always creates a new access token, but existing access tokens can be rotated and managed using the token management API (Section 6). The client instance can send an update continuation request (Section 5.3) to modify the requested access, causing the AS to move the request back to the processing state for re-evaluation. If the AS determines that no additional tokens can be issued, and that no additional updates are to be accepted (such as the continuation access tokens have expired), the grant is moved to the finalized state.
     */
    Approved = 'approved',
    /**
     * After the access tokens are issued, if the AS does not allow any additional updates on the grant request, the grant request enters the finalized state. This state is also entered when an existing grant request is revoked by the client instance (Section 5.4) or otherwise revoked by the AS (such as through out-of-band action by the RO). This state can also be entered if the AS determines that no additional processing is possible, for example if the RO has denied the requested access or if interaction is required but no compatible interaction methods are available. Once in this state, no new access tokens can be issued, no subject information can be returned, and no interactions can take place. Once in this state, the grant request is dead and cannot be revived. If future access is desired by the client instance, a new grant request can be created, unrelated to this grant request.
     */
    Finalized = 'finalized'
}