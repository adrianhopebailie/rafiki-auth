import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'grants'

  // TODO - Unique checks on compound columns like (continue_id, continue_token)

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().primary()
      table.uuid('client_id').references('id').inTable('clients').onDelete('CASCADE')

      table.string('state').notNullable()
      table.specificType('supported_start_methods', 'text[]').notNullable()
  
      table.string('continue_token').unique()
      table.integer('wait')
  
      table.string('finish_method')
      table.string('finish_uri')
      table.string('finish_nonce')
  
      table.string('interact_nonce')
  
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
