const knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: './scores.db'
    },
    useNullAsDefault: true
  });
  
  // Create table if not exists
  knex.schema.hasTable('scores').then(exists => {
    if (!exists) {
      return knex.schema.createTable('scores', table => {
        table.increments('id').primary();
        table.string('name', 20);
        table.integer('score');
        table.timestamp('created_at').defaultTo(knex.fn.now());
      });
    }
  });
  
  module.exports = knex;