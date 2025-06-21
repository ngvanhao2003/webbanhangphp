const contactHandler = require('../../handlers/contact.handler');
const contactSchema = require('./schema');

module.exports = function (fastify, opts, done) {
  // Create a new contact message (public route)
  fastify.post(
    '/',
    { schema: contactSchema.contactCreateSchema.schema },
    contactHandler.createContact
  );

  // Get all contacts (admin route)
  fastify.get(
    '/',
    { 
      preValidation: [fastify.authenticate, fastify.isAdmin]
    },
    contactHandler.getAllContacts
  );

  // Update contact status (admin route)
  fastify.patch(
    '/:id/status',
    { 
      schema: contactSchema.contactUpdateStatusSchema.schema,
      preValidation: [fastify.authenticate, fastify.isAdmin]
    },
    contactHandler.updateContactStatus
  );

  // Delete a contact (admin route)
  fastify.delete(
    '/:id',
    { 
      schema: contactSchema.contactDeleteSchema.schema,
      preValidation: [fastify.authenticate, fastify.isAdmin]
    },
    contactHandler.deleteContact
  );

  // Get contact statistics (admin route)
  fastify.get(
    '/stats',
    { 
      schema: contactSchema.contactStatsSchema.schema,
      preValidation: [fastify.authenticate, fastify.isAdmin]
    },
    contactHandler.getContactStats
  );

  fastify.get(
    '/:id',
    { 
      // schema: contactSchema.contactGetOneSchema.schema, // Tạm thời comment dòng này lại để test
      preValidation: [fastify.authenticate, fastify.isAdmin]
    },
    contactHandler.getOneContact // Gọi handler để xử lý yêu cầu
  );

  // Update entire contact (admin route)
  fastify.put(
    '/:id',
    { 
      // Có thể thêm schema: contactSchema.contactUpdateSchema.schema nếu có
      preValidation: [fastify.authenticate, fastify.isAdmin]
    },
    contactHandler.updateContact
  );

  done();
}