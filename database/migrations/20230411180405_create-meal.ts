import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('mealID').primary()
    table.uuid('session_id').index()
    table
      .uuid('userID')
      .references('users.id')
      .notNullable()
      .onDelete('CASCADE')
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.text('date').notNullable()
    table.text('time').notNullable()
    table.text('inDiet').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
