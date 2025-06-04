// const path = require('path');
// // const fs = require('fs');
// const generateFileHash = require('../utils/generateFileHash');

// const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
// const maxFileSize = 1 * 1024 * 1024; 
// const maxFiles = 2;
// const storedHashes = new Set();

// const validateImages = async (req, res, next) => {
//     const files = req.files;
//     const errors = [];

//     if (!files || files.length === 0) {
//         return res.status(400).json({ error: "No images uploaded. Please upload atleast one image." });
//     }

//     if (files.length > maxFiles) {
//         return res.status(400).json({ error: `Maximum file upload limit is ${maxFiles}.` });
//     }


//     if (files && files.length > 0) {
//         for (const file of files) {
//             const ext = path.extname(file.originalname).toLowerCase();
//             const filePath = path.join(__dirname, '../public/uploads', file.filename);

//             if (!allowedExtensions.includes(ext)) {
//                 errors.push(`Invalid file type: ${file.originalname}. Allowed extensions: ${allowedExtensions.join(', ')}`);
//                 continue;
//             }

//             if (file.size > maxFileSize) {
//                 console.log(`File ${file.originalname} is too large!`);
//                 errors.push(`File size exceeds limit: ${file.originalname}. Max allowed size is ${maxFileSize / (1024 * 1024)}MB`);
//                 continue;
//             }

//             try {
//                 const fileHash = await generateFileHash(filePath);
//                 if (storedHashes.has(fileHash)) {
//                     fs.unlinkSync(filePath);
//                     errors.push(`Duplicate image detected: ${file.originalname}`);
//                     continue;
//                 }
//                 storedHashes.add(fileHash);
//             } catch (error) {
//                 errors.push(`Error processing file: ${file.originalname}`);
//             }
//         }
//     }

//     if (errors.length > 0) {
//         return res.status(400).json({ errors });
//     }

//     next();
// };

// module.exports = validateImages;

const path = require('path');
const generateFileHash = require('../utils/generateFileHash');

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
const maxFileSize = 1 * 1024 * 1024; // 1 MB
const maxFiles = 2;
const storedHashes = new Set();

const validateImages = async (req, res, next) => {
    const files = req.files;
    const errors = [];

    if (!files || files.length === 0) {
        return res.status(400).json({ error: "No images uploaded. Please upload at least one image." });
    }

    if (files.length > maxFiles) {
        return res.status(400).json({ error: `Maximum file upload limit is ${maxFiles}.` });
    }

    for (const file of files) {
        const ext = path.extname(file.originalname).toLowerCase();

        if (!allowedExtensions.includes(ext)) {
            errors.push(`Invalid file type: ${file.originalname}. Allowed extensions: ${allowedExtensions.join(', ')}`);
            continue;
        }

        if (file.size > maxFileSize) {
            errors.push(`File size exceeds limit: ${file.originalname}. Max allowed size is ${maxFileSize / (1024 * 1024)}MB`);
            continue;
        }

        try {
            const fileHash = await generateFileHash(file.buffer);
            if (storedHashes.has(fileHash)) {
                errors.push(`Duplicate image detected: ${file.originalname}`);
                continue;
            }
            storedHashes.add(fileHash);
        } catch (error) {
            errors.push(`Error processing file: ${file.originalname}`);
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

module.exports = validateImages;
