const fs = require('fs');
const path = require('path');
const util = require('util');
const pump = util.promisify(require('stream').pipeline);

async function uploadFile(request, reply) {
  try {
    const data = await request.file();

    if (!data || !data.filename) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    const filename = data.filename.replace(/\s+/g, '_');
    const uploadDir = path.join(global.appRoot, 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    const fileUrl = `${process.env.HOST?.trim() || 'http://localhost:3000'}/uploads/${filename}`;

    // Lưu file stream vào ổ đĩa
    await pump(data.file, fs.createWriteStream(filePath));

    // Trả về URL file hoặc thông tin thành công
    return reply.code(200).send({
      success: true,
      filename,
      url: fileUrl,
    });
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ error: 'Failed to upload file' });
  }
}

module.exports = {
  uploadFile,
};
