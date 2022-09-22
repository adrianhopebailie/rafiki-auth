import GrantService from '../app/Services/grant'
import ClientService from '../app/Services/client'

declare module '@ioc:Gnap/GrantService' {
    const GrantService: GrantService
    export default GrantService
}

declare module '@ioc:Gnap/ClientService' {
    const ClientService: ClientService
    export default ClientService
}