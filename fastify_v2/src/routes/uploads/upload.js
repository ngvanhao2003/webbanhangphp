const uploadHandler = require('../../handlers/upload.handler');
const uploadSchema = require('./schema');
module.exports = function (fastify, opts, done) {
    fastify.post('/api/upload',{schema: uploadSchema.uploadFileSchema}, uploadHandler.uploadFile);

    done();
}