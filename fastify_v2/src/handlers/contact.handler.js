const contactService = require('../services/contact.service');

// Get all contacts
const getAllContacts = async (request, reply) => {
  try {
    const filters = request.query;
    const contacts = await contactService.getAllContacts(filters);
    return reply.code(200).send({
      success: true,
      data: contacts
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Get a single contact by ID
const getOneContact = async (request, reply) => {
  const { id } = request.params;
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return reply.code(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid ID format'
    });
  }
  try {
    const contact = await contactService.getContactById(id);
    console.log("Contact found:", contact);

    if (!contact) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Contact not found'
      });
    }

    // Luôn trả về plain object
    const plainContact = contact.toObject ? contact.toObject() : JSON.parse(JSON.stringify(contact));
    return reply.code(200).send({
      success: true,
      data: plainContact
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};


// Create a new contact message
const createContact = async (request, reply) => {
  try {
    const contactData = request.body;
    const newContact = await contactService.createContact(contactData);
    
    // Send confirmation notification here if needed
    
    return reply.code(201).send({
      statusCode: 201,
      message: 'Contact message sent successfully',
      data: newContact
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Update contact status
const updateContactStatus = async (request, reply) => {
  try {
    const { id } = request.params;
    const { status } = request.body;
    const existingContact = await contactService.getContactById(id);
    if (!existingContact) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Contact not found'
      });
    }
    const updatedContact = await contactService.updateContactStatus(id, status);
    return reply.code(200).send({
      success: true,
      data: updatedContact
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Update entire contact (PUT)
const updateContact = async (request, reply) => {
  const { id } = request.params;
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return reply.code(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid ID format'
    });
  }
  try {
    const updateData = request.body;
    const updatedContact = await contactService.updateContact(id, updateData);
    if (!updatedContact) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Contact not found'
      });
    }
    return reply.code(200).send({
      success: true,
      data: updatedContact
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

const deleteContact = async (request, reply) => {
  try {
    const { id } = request.params;
    const existingContact = await contactService.getContactById(id);
    if (!existingContact) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Contact not found'
      });
    }
    const deletedContact = await contactService.deleteContact(id);
    return reply.code(200).send({
      success: true,
      data: deletedContact
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Get contact statistics by status
const getContactStats = async (request, reply) => {
  try {
    const stats = await contactService.countContactsByStatus();
    return reply.code(200).send({
      success: true,
      data: stats
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

module.exports = {
  getAllContacts,
  getOneContact,
  createContact,
  updateContactStatus,
  deleteContact,
  getContactStats,
  updateContact // thêm vào exports
};