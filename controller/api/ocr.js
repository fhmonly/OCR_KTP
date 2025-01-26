
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const ocrKTP = require('../../services/ocr-ktp')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const extname = path.extname(file.originalname);
        cb(null, Date.now() + extname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('File format not allowed!'), false);
        }
    }
});

const getDataFromKTPWithOCR = [
    upload.single('image'),
    async (req, res) => {
        const imagePath = req.file?.path;
        const extname = path.extname(req.file.originalname);
        const grayscalePath = path.join('uploads', `grayscale_${path.basename(imagePath, extname)}${extname}`);

        try {
            const result = await ocrKTP.KTPDataExtractor(imagePath, grayscalePath)
            res.json(result);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'OCR processing failed', details: err.message });
        } finally {
            for (const file of [imagePath, grayscalePath]) {
                fs.unlink(file, (err) => {
                    if (err) {
                        console.error(`Failed to delete file: ${file}`, err);
                    } else {
                        console.log(`File deleted: ${file}`);
                    }
                });
            }
        }
    }
]

module.exports = {
    getDataFromKTPWithOCR
}