const uploadFileSchema =  {
    description: 'Upload a file',
    tags: ['file'],
    summary: 'Upload a file to the server',
    consumes: ['multipart/form-data'],
    response: {
        200: {
            description: 'File uploaded successfully',
            type: 'object',
            properties: {
                message: { type: 'string' },
                filename: { type: 'string' },
                url: { type: 'string' },
            },
        },
        500: {
            description: 'Bad request',
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    },
}