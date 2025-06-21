const Contact = require('../model/contact.model');

// Get all contacts with optional filters
const getAllContacts = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  // Add date range filtering if provided
  if (filters.startDate && filters.endDate) {
    query.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }

  return Contact.find(query).sort({ createdAt: -1 });
};

// Get a single contact by ID
const getContactById = async (id) => {
  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ID format');
    }
    // Sử dụng lean() để trả về plain object
    const contact = await Contact.findById(id).lean();
    console.log('Contact found:', contact);
    return contact;
  } catch (error) {
    console.error('Error fetching contact:', error);
    throw error;
  }
};

// Create a new contact
const createContact = async (contactData) => {
  const contact = new Contact(contactData);
  return contact.save();
};

// Update a contact status
const updateContactStatus = async (id, status) => {
  return Contact.findByIdAndUpdate(
    id,
    { 
      status, 
      updatedAt: Date.now() 
    },
    { new: true }
  );
};

// Update entire contact (PUT)
const updateContact = async (id, updateData) => {
  return Contact.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: Date.now() },
    { new: true }
  ).lean();
};

// Delete a contact
const deleteContact = async (id) => {
  return Contact.findByIdAndDelete(id);
};

// Count contacts by status
const countContactsByStatus = async () => {
  return Contact.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContactStatus,
  deleteContact,
  countContactsByStatus,
  updateContact // thêm vào exports
};