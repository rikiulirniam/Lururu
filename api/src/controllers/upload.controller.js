const multer = require('multer');
const upload = require('../middleware/upload');

const uploadFile = (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: "Ukuran file terlalu besar, maksimal 5MB" });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ message: "Tidak ada file yang diunggah" });
            }

            const fileUrl = `${req.protocol}://${req.get('host')}/api/uploads/files/${req.file.filename}`;
            const fileType = req.file.mimetype.split('/')[1];

            res.status(201).json({
                message: "File berhasil diunggah",
                file_url: fileUrl,
                file_type: fileType
            });
        } catch (error) {
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    });
};

module.exports = { uploadFile };