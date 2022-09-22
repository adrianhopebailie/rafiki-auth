import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, beforeCreate } from '@ioc:Adonis/Lucid/Orm'
import Grant from './Grant'
import { AccessType, ResourceAction } from '../../providers/Gnap/types'

export default class GrantAccess extends BaseModel {

  public static selfAssignPrimaryKey = true

  @beforeCreate()
  public static assignUuid(grantAccess: GrantAccess) {
    grantAccess.id = uuid()
  }

  @column({ isPrimary: true })
  public id: string

  @column() // Not Nullable
  public type: AccessType

  @column() // Not Nullable
  public actions: ResourceAction[]

  @column()
  public identifier: string

  @column() // Not Nullable
  public locations: string[]

  @column()
  public interval: string

  @column() // Jsonb - TODO - Parse JSON
  public limits: any

  // Relations

  @column()
  public grantId: string

  @belongsTo(() => Grant)
  public grant: BelongsTo<typeof Grant>

  // Timestamps
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}