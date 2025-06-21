const contactCreateSchema = require('./contact.create.schema');
const contactGetAllSchema = require('./contact.getall.schema');
const contactGetOneSchema = require('./contact.getone.schema');
const contactUpdateStatusSchema = require('./contact.update.status.schema');
const contactDeleteSchema = require('./contact.delete.schema');
const contactStatsSchema = require('./contact.stats.schema');
module.exports = {
  contactCreateSchema,
  contactGetAllSchema,
  contactGetOneSchema,
  contactUpdateStatusSchema,
  contactDeleteSchema,
  contactStatsSchema
};