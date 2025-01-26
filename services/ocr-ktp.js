const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const FuzzySet = require('fuzzyset.js');

const validWords = FuzzySet(['NIK', 'Nama', 'Tempat', 'Tgl', 'Lahir', 'Jenis', 'Kelamin', 'Alamat', 'RT', 'RW', 'Kel', 'Desa', 'Kecamatan', 'Agama', 'Status', 'Perkawinan', 'Pekerjaan', 'Kewarganegaraan', 'Berlaku', 'Hingga', 'Gol', 'Darah', 'LAKI-LAKI', 'PEREMPUAN', 'ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU', 'SEUMUR', 'HIDUP', 'TempatTglLahir', 'KelDesa', 'RTRW', 'GolDarah'
]);

function correctWord(word) {
    const suggestions = validWords.get(word);
    if (suggestions && suggestions[0][0] > 0.7) {
        return suggestions[0][1];
    }
    return word;
}

function makeObjFromSentencesArr(sentences) {
    const result = {
        agama: "-",
        alamat: "-",
        desa: '-',
        gol_darah: "-",
        jenis_kelamin: "-",
        kecamatan: "-",
        kewarganegaraan: "-",
        nama: "-",
        nik: "-",
        pekerjaan: "-",
        rt: "-",
        rw: "-",
        status_perkawinan: "-",
        tanggal_lahir: "-",
        tempat_lahir: "-",
    }
    sentences.forEach(v => {
        const words = v.split(/\s+/);
        const correctedWords = words.map((word) => correctWord(word));
        const correctedText = correctedWords.join(' ');

        const extractWithRegex = (pattern, keys) => {
            const match = correctedText.match(pattern);
            keys.forEach((key, index) => {
                if (result[key] === '-')
                    result[key] = (match || [])[index + 1] || '-';
            });
        };

        // NIK
        if (correctedText.match(/NIK/i)) {
            extractWithRegex(/NIK[^\w_]*(\d+)/i, ['nik']);
        }

        // Nama
        if (correctedText.match(/Nama/i)) {
            extractWithRegex(/Nama[^\w_]*([\w\s]+)/i, ['nama']);
        }

        // Tempat/Tgl Lahir
        if (correctedText.match(/Tempat.*Tgl.*Lahir/i)) {
            extractWithRegex(
                /Tempat.*Tgl.*Lahir[^\w_]*([\w\s]+),\s*(\d{2}-\d{2}-\d{4})/i,
                ['tempat_lahir', 'tanggal_lahir']
            );
        }

        // Jenis Kelamin
        if (correctedText.match(/Jenis.*Kelamin/i)) {
            extractWithRegex(
                /Jenis.*Kelamin[^\w_]*(laki-laki|perempuan)/i,
                ['jenis_kelamin'],

            );
        }

        // Alamat
        if (correctedText.match(/Alamat/i)) {
            extractWithRegex(/Alamat[^\w_]*([\w\s.\/]+)/i, ['alamat']);
        }

        // RT/RW
        if (correctedText.match(/RT.*RW/i)) {
            extractWithRegex(/RT.*RW[^\w_]*(\d+)\/(\d+)/i, ['rt', 'rw']);
        }

        // Kel/Desa
        if (correctedText.match(/Kel.*Desa/i)) {
            extractWithRegex(/Kel.*Desa[^\w_]*([\w\s]*)/i, ['desa']);
        }

        // Kecamatan
        if (correctedText.match(/Kecamatan/i)) {
            extractWithRegex(/Kecamatan[^\w_]*([\w\s]+)/i, ['kecamatan']);
        }

        // Agama
        if (correctedText.match(/Agama/i)) {
            extractWithRegex(/Agama[^\w_]*([\w]+)/i, ['agama']);
        }

        // Status Perkawinan
        if (correctedText.match(/Status.*Perkawinan/i)) {
            extractWithRegex(
                /Status.*Perkawinan[^\w_]*(BELUM KAWIN|KAWIN)/i,
                ['status_perkawinan']
            );
        }

        // Pekerjaan
        if (correctedText.match(/Pekerjaan/i)) {
            extractWithRegex(/Pekerjaan[^\w_]*([\w\s]+)/i, ['pekerjaan']);
        }

        // Kewarganegaraan
        if (correctedText.match(/Kewarganegaraan/i)) {
            extractWithRegex(
                /Kewarganegaraan[^\w_]*([\w]+)/i,
                ['kewarganegaraan']
            );
        }

        // Gol Darah
        if (correctedText.match(/Gol.*Darah/i)) {
            extractWithRegex(/Gol.*Darah[^\w_]*(A|B|AB|O)?[+-]?/i, ['gol_darah']);
        }
    })
    return result
}
async function KTPDataExtractor(imagePath, grayscalePath) {
    await sharp(imagePath)
        .grayscale()
        .toFile(grayscalePath);

    const { data: { text } } = await Tesseract.recognize(grayscalePath, 'ind', {
        logger: (info) => console.log(info),
    });

    const sentences = text.split('\n').filter(c => ![null, undefined, ''].includes(c.toString().trim()))
    return makeObjFromSentencesArr(sentences)
}

module.exports = {
    KTPDataExtractor
}