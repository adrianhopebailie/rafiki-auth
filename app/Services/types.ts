// https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-grant-response
export type GrantResponse = {
    /**
     * Indicates that the client instance can continue the request by making one or more continuation requests.
     * REQUIRED if continuation calls are allowed for this client instance on this grant request. See Section 3.1.
     */
    continue?: ContinueResponse,

    /**
     * A single access token or set of access tokens that the client instance can use to call the RS on behalf of the RO.
     * REQUIRED if an access token is included. See Section 3.2.
     */
    access_token?: AccessTokenResponse | AccessTokenResponse[],

    /**
     * Indicates that interaction through some set of defined mechanisms needs to take place.
     * REQUIRED if interaction is needed or allowed. See Section 3.3.
     */
    interact?: InteractResponse,

    /**
     * Claims about the RO as known and declared by the AS. 
     * REQUIRED if subject information is included. See Section 3.4.
     */
    subject?: SubjectResponse,

    /**
     * An identifier this client instance can use to identify itself when making future requests. 
     * OPTIONAL. See Section 3.5.
     */
    instance_id?: string
} | {
    /**
     * An error code indicating that something has gone wrong.
     * REQUIRED for an error condition. If included, other fields MUST NOT be included. See Section 3.6.
     */
    error: ErrorCode
    error_description: string
}

export type ContinueResponse = {
    // The URI at which the client instance can make continuation requests. This URI MAY vary per request, or MAY be stable at the AS. The client instance MUST use this value exactly as given when making a continuation request (Section 5). REQUIRED.
    uri: string

    // The amount of time in integer seconds the client instance MUST wait after receiving this request continuation response and calling the continuation URI. The value SHOULD NOT be less than five seconds, and omission of the value MUST NOT be interpreted as zero (i.e., no delay between requests). RECOMMENDED.
    wait: number

    // A unique access token for continuing the request, called the "continuation access token". The value of this property MUST be in the format specified in Section 3.2.1. This access token MUST be bound to the client instance's key used in the request and MUST NOT be a bearer token. As a consequence, the flags array of this access token MUST NOT contain the string bearer and the key field MUST be omitted. The client instance MUST present the continuation access token in all requests to the continuation URI as described in Section 7.2. REQUIRED.
    access_token: AccessTokenResponse
}

export type AccessTokenResponse = {
    // The value of the access token as a string. The value is opaque to the client instance. The value SHOULD be limited to ASCII characters to facilitate transmission over HTTP headers within other protocols without requiring additional encoding. REQUIRED.
    value: string

    // The value of the label the client instance provided in the associated token request (Section 2.1), if present. REQUIRED for multiple access tokens, OPTIONAL for single access token.
    label?: string

    // The management URI for this access token. If provided, the client instance MAY manage its access token as described in Section 6. This management URI is a function of the AS and is separate from the RS the client instance is requesting access to. This URI MUST NOT include the access token value and SHOULD be different for each access token issued in a request. OPTIONAL.
    manage?: string

    // A description of the rights associated with this access token, as defined in Section 8. If included, this MUST reflect the rights associated with the issued access token. These rights MAY vary from what was requested by the client instance. REQUIRED.
    access?: AccessRight[]

    // The number of seconds in which the access will expire. The client instance MUST NOT use the access token past this time. An RS MUST NOT accept an access token past this time. Note that the access token MAY be revoked by the AS or RS at any point prior to its expiration. OPTIONAL.
    expires_in?: number

    // The key that the token is bound to, if different from the client instance's presented key. The key MUST be an object or string in a format described in Section 7.1. The client instance MUST be able to dereference or process the key information in order to be able to sign the request. OPTIONAL.
    key?: string

    // A set of flags that represent attributes or behaviors of the access token issued by the AS. OPTIONAL.
    flags?: AccessTokenFlag[]
}

export enum AccessTokenFlag {
    // This flag indicates whether the token is a bearer token, not bound to a key and proofing mechanism. If the bearer flag is present, the access token is a bearer token, and the key field in this response MUST be omitted. If the bearer flag is omitted and the key field in this response is omitted, the token is bound the key used by the client instance (Section 2.3) in its request for access. If the bearer flag is omitted, and the key field is present, the token is bound to the key and proofing mechanism indicated in the key field. See Section 12.7 for additional considerations on the use of bearer tokens.
    'bearer',
    // Flag indicating a hint of AS behavior on token rotation. If this flag is present, then the client instance can expect a previously-issued access token to continue to work after it has been rotated (Section 6.1) or the underlying grant request has been modified (Section 5.3), resulting in the issuance of new access tokens. If this flag is omitted, the client instance can anticipate a given access token could stop working after token rotation or grant request modification. Note that a token flagged as durable can still expire or be revoked through any normal means.
    'durable'
}

export type AccessRight = {
    /**
     * The type of resource request as a string. This field MAY define which other fields are allowed in the request object. REQUIRED.
     */
    type: AccessType

    /**
     * The types of actions the client instance will take at the RS as an array of strings. For example, a client instance asking for a combination of "read" and "write" access.
     */
    actions: ResourceAction

    /**
     * The location of the RS as an array of strings. These strings are typically URIs identifying the location of the RS.
     */
    locations: URL[]

    /**
     * The kinds of data available to the client instance at the RS's API as an array of strings. For example, a client instance asking for access to raw "image" data and "metadata" at a photograph API.
     */
    datatypes: string[]

    /**
     * A string identifier indicating a specific resource at the RS. For example, a patient identifier for a medical API or a bank account number for a financial API.
     */
    identifier: string

    /**
     * The types or levels of privilege being requested at the resource. For example, a client instance asking for administrative level access, or access when the resource owner is no longer online.
     */
    privileges: string[]
}

/**
 * https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-interacting-with-the-user
 */
export type InteractRequest = {
    /**
     * Indicates how the client instance can start an interaction. REQUIRED.
     */
    start: StartMethod[];

    /**
     * Indicates how the client instance can receive an indication that interaction has finished at the AS. OPTIONAL.
     */
    finish?: { 
        method: FinishMethod; 
        uri: string; 
        nonce: string 
    };
    /**
     * Provides additional information to inform the interaction process at the AS. OPTIONAL.
     */
    hints?: any
}

// https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-interaction-modes
export type InteractResponse = {
    /**
     * Redirect to an arbitrary URI. REQUIRED if the redirect interaction start mode is possible for this request. See Section 3.3.1.
     */
    redirect?: string
    
    /**
     * Launch of an application URI. REQUIRED if the app interaction start mode is possible for this request. See Section 3.3.2.
     */
    app?: string

    /**
     * Display a short user code. REQUIRED if the user_code interaction start mode is possible for this request. See Section 3.3.3.
     */
    user_code?: string

    /**
     * Display a short user code and URL. REQUIRED if the user_code_uri interaction start mode is possible for this request. Section 3.3.4
     */
    user_code_uri?: {
        
        /**
         * A unique short code that the end user can type into a provided URI. This string MUST be case-insensitive, MUST consist of only easily typeable characters (such as letters or numbers). The time in which this code will be accepted SHOULD be short lived, such as several minutes. It is RECOMMENDED that this code be no more than eight characters in length. REQUIRED.
         */
        code: string

        /**
         * The interaction URI that the client instance will direct the RO to. This URI MUST be short enough to be communicated to the end user. It is RECOMMENDED that this URI be short enough for an end user to type in manually. The URI MUST NOT contain the code value. REQUIRED.
         */
        uri: string

    }
    
    /**
     * A nonce used by the client instance to verify the callback after interaction is completed. REQUIRED if the interaction finish method requested by the client instance is possible for this request. See Section 3.3.5.
     */
    finish?: string
    
    /**
     * The number of integer seconds after which this set of interaction responses will expire and no longer be usable by the client instance. If the interaction methods expire, the client MAY re-start the interaction process for this grant request by sending an update (Section 5.3) with a new interaction request (Section 2.5) section. OPTIONAL. If omitted, the interaction response modes returned do not expire.
     */
    expires_in?: number
    
}

export type SubjectResponse = {

}

// https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#response-error
export enum ErrorCode {
    /**
     * The request is missing a required parameter, includes an invalid parameter value or is otherwise malformed.
     */
    InvalidRequest = 'invalid_request',

    /**
     * The request was made from a client that was not recognized or allowed by the AS, or the client's signature validation failed.
     */
    InvalidClient = 'invalid_client',

    /**
     * The RO denied the request.
     */
    UserDenied = 'user_denied',

    /**
     * The client instance did not respect the timeout in the wait response.
     */
    TooFast = 'too_fast',

    /**
     *  The request referenced an unknown ongoing access request.
     */
    UnknownRequest = 'unknown_request',

    /**
     * The request was denied for an unspecified reason.
     */
    RequestDenied = 'request_denied',

    /**
     * The client instance has provided an interaction reference that is incorrect for this request or the interaction modes in use have expired.
     */
    InvalidInteraction = 'invalid_interaction'
}

// https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-start-mode-definitions
export enum StartMethod {
    /**
     * Indicates that the client instance can direct the end user to an arbitrary URI for interaction. Section 2.5.1.1
     */
    Redirect = 'redirect',
    /**
     * Indicates that the client instance can launch an application on the end user's device for interaction. Section 2.5.1.2
     */
    App = 'app',

    /**
     * Indicates that the client instance can communicate a human-readable short code to the end user for use with a stable URI. Section 2.5.1.3
     */
    UserCode = 'user_code',

    /**
     * Indicates that the client instance can communicate a human-readable short code to the end user for use with a short, dynamic URI. Section 2.5.1.4
     */
    UserCodeUri = 'user_code_uri',

}

export enum FinishMethod {
    Redirect = 'redirect',
    Push = 'push'
}

// https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-finish-interaction-methods
export type FinishMethodResponse = {
    /**
     * The callback method that the AS will use to contact the client instance. REQUIRED.
     */
    method: FinishMethod,

    /**
     * Indicates the URI that the AS will either send the RO to after interaction or send an HTTP POST request. This URI MAY be unique per request and MUST be hosted by or accessible by the client instance. This URI MUST NOT contain any fragment component. This URI MUST be protected by HTTPS, be hosted on a server local to the RO's browser ("localhost"), or use an application-specific URI scheme. If the client instance needs any state information to tie to the front channel interaction response, it MUST use a unique callback URI to link to that ongoing state. The allowable URIs and URI patterns MAY be restricted by the AS based on the client instance's presented key information. The callback URI SHOULD be presented to the RO during the interaction phase before redirect. REQUIRED for redirect and push methods.
     */
    uri: URL

    /**
     * Unique value to be used in the calculation of the "hash" query parameter sent to the callback URI, must be sufficiently random to be unguessable by an attacker. MUST be generated by the client instance as a unique value for this request. REQUIRED.
     */
    nonce: string

    /**
     * An identifier of a hash calculation mechanism to be used for the callback hash in Section 4.2.3, as defined in the IANA Named Information Hash Algorithm Registry. If absent, the default value is sha3-512. OPTIONAL.
     */
    hash_method: HashMethod
}

export type HashMethod = 'sha3-512' // | 'sha-256'	| 'blake2b-256' - TODO - Need a mapping function for these to Node's crypto module algo names

export enum InteractionState {
    Pending = 'pending',
    Approved = 'approved',
    Denied = 'denied', 
    Expired = 'expired',
}

/**
 * Open Payments Specific Types
 */
export enum AccessType {
    Account = 'account',
    IncomingPayment = 'incoming-payment',
    OutgoingPayment = 'outgoing-payment',
    Quote = 'quote'
}

export enum ResourceAction {
    Create = 'create',
    Read = 'read',
    List = 'list',
    Complete = 'complete'
}

interface BaseAccessRequest {
    actions: ResourceAction[]
    locations?: string[]
    identifier?: string
    interval?: string
}

interface IncomingPaymentRequest extends BaseAccessRequest {
    type: AccessType.IncomingPayment
    limits?: never
}

interface OutgoingPaymentRequest extends BaseAccessRequest {
    type: AccessType.OutgoingPayment
    limits?: OutgoingPaymentLimit
}

interface AccountRequest extends BaseAccessRequest {
    type: AccessType.Account
    limits?: never
}

interface QuoteRequest extends BaseAccessRequest {
    type: AccessType.Quote
    limits?: never
}

export type AccessRequest =
    | IncomingPaymentRequest
    | OutgoingPaymentRequest
    | AccountRequest
    | QuoteRequest

export function isAccessType(accessType: AccessType): accessType is AccessType {
    return Object.values(AccessType).includes(accessType)
}

export function isAction(actions: ResourceAction[]): actions is ResourceAction[] {
    if (!Array.isArray(actions)) return false
    for (const action of actions) {
        if (!Object.values(ResourceAction).includes(action)) return false
    }
    return true
}

function isIncomingPaymentAccessRequest(
    accessRequest: AccessRequest
): accessRequest is IncomingPaymentRequest {
    return (
        accessRequest.type === AccessType.IncomingPayment &&
        isAction(accessRequest.actions) &&
        !accessRequest.limits
    )
}

function isOutgoingPaymentAccessRequest(
    accessRequest: AccessRequest
): accessRequest is OutgoingPaymentRequest {
    return (
        accessRequest.type === AccessType.OutgoingPayment &&
        isAction(accessRequest.actions) &&
        (!accessRequest.limits || isOutgoingPaymentLimit(accessRequest.limits))
    )
}

function isAccountAccessRequest(
    accessRequest: AccessRequest
): accessRequest is AccountRequest {
    return (
        accessRequest.type === AccessType.Account &&
        isAction(accessRequest.actions) &&
        !accessRequest.limits
    )
}

function isQuoteAccessRequest(
    accessRequest: AccessRequest
): accessRequest is QuoteRequest {
    return (
        accessRequest.type === AccessType.Quote &&
        isAction(accessRequest.actions) &&
        !accessRequest.limits
    )
}

export function isAccessRequest(
    accessRequest: any
): accessRequest is AccessRequest {
    return (
        isIncomingPaymentAccessRequest(accessRequest as AccessRequest) ||
        isOutgoingPaymentAccessRequest(accessRequest as AccessRequest) ||
        isAccountAccessRequest(accessRequest as AccessRequest) ||
        isQuoteAccessRequest(accessRequest as AccessRequest)
    )
}

// value should hold bigint, serialized as string for requests
// & storage as jsonb (postgresql.org/docs/current/datatype-json.html) field in postgres
export interface PaymentAmount {
    value: string
    assetCode: string
    assetScale: number
}

export type OutgoingPaymentLimit = {
    receiver: string
    sendAmount?: PaymentAmount
    receiveAmount?: PaymentAmount
}

export type LimitData = OutgoingPaymentLimit

function isPaymentAmount(
    paymentAmount: any | undefined
): paymentAmount is PaymentAmount {
    return (
        paymentAmount?.value !== undefined &&
        paymentAmount?.assetCode !== undefined &&
        paymentAmount?.assetScale !== undefined
    )
}

export function isOutgoingPaymentLimit(
    limit: any
): limit is OutgoingPaymentLimit {
    return (
        typeof limit?.receiver === 'string' &&
        isPaymentAmount(limit?.sendAmount) &&
        isPaymentAmount(limit?.receiveAmount)
    )
}