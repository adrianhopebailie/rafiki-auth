import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, beforeCreate } from '@ioc:Adonis/Lucid/Orm'
import Grant from './Grant'
import { InteractionState, StartMethod } from '../../providers/Gnap/types'

export default class Interaction extends BaseModel {

    public static selfAssignPrimaryKey = true

    @beforeCreate()
    public static assignUuid(interaction: Interaction) {
        interaction.id = uuid()
    }

    @column({ isPrimary: true })
    public id: string

    @column()
    public method: StartMethod

    @column()
    public uri?: string

    @column()
    public code?: string

    /**
     * The reference assigned to this interaction by the AS
     */
    @column()
    public reference?: string

    @column()
    public state: InteractionState

    @column.dateTime()
    public expiresAt: DateTime

    @column.dateTime()
    public startedAt: DateTime

    @column.dateTime()
    public finishedAt: DateTime

    // Relations
    @column()
    public grantId: string

    @belongsTo(() => Grant)
    public grant: BelongsTo<typeof Grant>

    // Timestamp
    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
