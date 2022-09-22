import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'grant_interactions'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().primary()
      table.uuid('grant_id').references('id').inTable('grants').onDelete('CASCADE')
      
      table.string('method').notNullable()
      table.string('uri')
      table.string('code')
      table.string('reference')
      table.string('state').notNullable().defaultTo('pending')
      table.timestamp('expires_at', { useTz: true })
      table.timestamp('started_at', { useTz: true })
      table.timestamp('finished_at', { useTz: true })

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
