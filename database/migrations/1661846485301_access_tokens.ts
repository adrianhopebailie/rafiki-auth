import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'access_tokens'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().primary()
      table.uuid('grant_id').references('id').inTable('grants')
      table.string('value').notNullable().unique()
      table.integer('expires_in').notNullable()
      table.timestamp('revoked_at', { useTz: true })

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
