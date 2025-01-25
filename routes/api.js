const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const FuzzySet = require('fuzzyset.js');

const upload = multer({ dest: 'uploads/' });

router.post('/ocr', upload.single('image'), async (req, res) => {
    const imagePath = req.file?.path;
    const grayscalePath = path.join('uploads', `grayscale_${Date.now()}_${req.file.filename}.png`);

    try {
        await sharp(imagePath)
            .grayscale()
            .toFile(grayscalePath);

        const { data: { text } } = await Tesseract.recognize(grayscalePath, 'ind', {
            logger: (info) => console.log(info),
        });

        const validWords = FuzzySet(['NIK', 'Nama', 'Tempat/Tgl Lahir', 'Jenis Kelamin', 'Alamat', 'RT/RW', 'Kel/Desa', 'Kecamatan', 'Agama', 'Status Perkawinan', 'Pekerjaan', 'Kewarganegaraan', 'Berlaku Hingga', 'Gol. Darah', 'LAKI-LAKI', 'PEREMPUAN', 'ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU', 'SEUMUR HIDUP'
        ]);

        function correctWord(word) {
            const suggestions = validWords.get(word);
            if (suggestions && suggestions[0][0] > 0.6) {
                return suggestions[0][1];
            }
            return word;
        }

        const sentences = text.split('\n').filter(c => ![null, undefined, ''].includes(c.toString().trim()))
        const result = {}
        sentences.forEach(v => {
            const words = v.split(/\s+/);
            const correctedWords = words.map((word) => correctWord(word));
            const correctedText = correctedWords.join(' ');

            const extractWithRegex = (pattern, keys, defaultValues = []) => {
                const match = correctedText.match(pattern);
                if (match) {
                    keys.forEach((key, index) => {
                        result[key] = match[index + 1] || defaultValues[index] || null;
                    });
                }
            };

            // NIK
            if (correctedText.includes('NIK')) {
                extractWithRegex(/NIK.*:\s*(\d+)/i, ['nik']);
            }

            // Nama
            if (correctedText.includes('Nama')) {
                extractWithRegex(/Nama.*:\s*([\w\s]+)/i, ['nama']);
            }

            // Tempat/Tgl Lahir
            if (correctedText.includes('Tempat/Tgl Lahir')) {
                extractWithRegex(
                    /Tempat.Tgl Lahir.*:\s*([\w\s]+),\s*(\d{2}-\d{2}-\d{4})/i,
                    ['tempat_lahir', 'tanggal_lahir']
                );
            }

            // Jenis Kelamin
            if (correctedText.includes('Jenis Kelamin')) {
                extractWithRegex(
                    /Jenis Kelamin.*:\s*(laki-laki|perempuan)/i,
                    ['jenis_kelamin']
                );
            }

            // Alamat
            if (correctedText.includes('Alamat')) {
                extractWithRegex(/Alamat.*:\s*([\w\s.\/]+)/i, ['alamat']);
            }

            // RT/RW
            if (correctedText.includes('RT/RW')) {
                extractWithRegex(/RT.RW\s*[-:\s]?\s*(\d+)\/(\d+)/i, ['rt', 'rw']);
            }

            // Kel/Desa
            if (correctedText.match(/Kel.Desa/i)) {
                extractWithRegex(/Kel.Desa.*:\s*([\w\s]*)/i, ['desa']);
            }

            // Kecamatan
            if (correctedText.includes('Kecamatan')) {
                extractWithRegex(/Kecamatan.*:\s*([\w\s]+)/i, ['kecamatan']);
            }

            // Agama
            if (correctedText.includes('Agama')) {
                extractWithRegex(/Agama.*:\s*([\w]+)/i, ['agama']);
            }

            // Status Perkawinan
            if (correctedText.includes('Status Perkawinan')) {
                extractWithRegex(
                    /Status Perkawinan.*:\s*(BELUM KAWIN|KAWIN)/i,
                    ['status_perkawinan']
                );
            }

            // Pekerjaan
            if (correctedText.includes('Pekerjaan')) {
                extractWithRegex(/Pekerjaan.*:\s*([\w\s]+)/i, ['pekerjaan']);
            }

            // Kewarganegaraan
            if (correctedText.includes('Kewarganegaraan')) {
                extractWithRegex(
                    /Kewarganegaraan.*:\s*([\w]+)/i,
                    ['kewarganegaraan']
                );
            }

            // Gol Darah
            if (correctedText.includes('Gol. Darah')) {
                extractWithRegex(/Gol.*Darah.*:\s*(A|B|AB|O)?[+-]?/i, ['gol_darah'], ['-']);
            }
        })

        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'OCR processing failed', details: err.message });

    } finally {
        [imagePath, grayscalePath].forEach(file => {
            fs.unlink(file, (err) => {
                if (err) console.error(`Failed to delete file: ${file}`, err);
            });
        });
    }
});

module.exports = router;