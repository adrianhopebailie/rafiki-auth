import { BaseCommand } from '@adonisjs/core/build/standalone'
import { GrantState } from '../app/Models/Grant'
import { AccessType, FinishMethod, ResourceAction, StartMethod } from '../providers/Gnap/types'

export default class Debug extends BaseCommand {
    public static commandName = 'debug'
    public static description = 'Executes random code in the Debug.ts file'

    public static settings = {
        loadApp: true,
        stayAlive: false,
    }

    public async run() {
        this.logger.info('Starting debug script...')

        const { default: Client } = await import('../app/Models/Client')
        const { default: Grant } = await import('../app/Models/Grant')
        const { default: Database } = await import('@ioc:Adonis/Lucid/Database')

        const client = await Client.query()
            .preload('keys')
            .firstOrFail()

        this.logger.info(JSON.stringify(client))

        const trx = await Database.transaction()

        const grant = new Grant()
            .fill({
                state: GrantState.Processing,
                supportedStartMethods: [StartMethod.Redirect],

                finishMethod: FinishMethod.Redirect,
            })
            .refreshContinueToken()

        await client
            .useTransaction(trx)
            .related('grants')
            .save(grant)


        const accesses = await grant
            .useTransaction(trx)
            .related('accesses')
            .createMany([{
                actions: [ResourceAction.Create],
                type: AccessType.OutgoingPayment,
                locations: ['']
            }])

        await trx.commit()


        this.logger.info(JSON.stringify(accesses))

    }
}
