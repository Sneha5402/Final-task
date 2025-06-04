// const fs = require('fs');
// const crypto = require('crypto');

// const generateFileHash = async (filePath) => {
//     try {
//         const fileBuffer = await fs.promises.readFile(filePath);
//         return crypto.createHash('sha256').update(fileBuffer).digest('hex');
//     } catch (err) {
//         console.error(`Error generating hash for ${filePath}: ${err.message}`);
//         throw err;
//     }
// };

// module.exports = generateFileHash;

const crypto = require('crypto');

/**
 * Generate SHA256 hash from a file Buffer.
 * @param {Buffer} buffer
 * @returns {string}
 */
const generateFileHash = async (buffer) => {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error('generateFileHash expects a Buffer');
    }

    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    return hash.digest('hex');
};

module.exports = generateFileHash;


