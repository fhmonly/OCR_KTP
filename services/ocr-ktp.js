const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const FuzzySet = require('fuzzyset.js');

const validWords = FuzzySet(['NIK', 'Nama', 'Tempat', 'Tgl', 'Lahir', 'Jenis', 'Kelamin', 'Alamat', 'RT', 'RW', 'Kel', 'Desa', 'Kecamatan', 'Agama', 'Status', 'Perkawinan', 'Pekerjaan', 'Kewarganegaraan', 'Berlaku', 'Hingga', 'Gol', 'Darah', 'LAKI-LAKI', 'PEREMPUAN', 'ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU', 'SEUMUR', 'HIDUP', 'TempatTglLahir', 'TempatTgl', 'Tempat/Tgl', 'Kel/Desa', 'KelDesa', 'RTRW', 'RT/RW', 'GolDarah'
]);

function correctWord(word) {
    const suggestions = validWords.get(word);
    if (suggestions && suggestions[0][0] > 0.8) {
        return suggestions[0][1];
    }
    return word;
}

function extractData(sentences) {
    const result = {
        nik: "-",
        agama: "-",
        alamat: "-",
        desa: '-',
        gol_darah: "-",
        jenis_kelamin: "-",
        kecamatan: "-",
        kewarganegaraan: "-",
        nama: "-",
        pekerjaan: "-",
        rt: "-",
        rw: "-",
        status_perkawinan: "-",
        tanggal_lahir: "-",
        tempat_lahir: "-",
    }
    function setResult(key, value) {
        if (!value) return
        if (result[key] === '-') {
            result[key] = value
        }
    }

    const [, fullRowNIK] = sentences.match(/(NIK[^]*)Nama/i) || []
    const [, nik] = fullRowNIK?.match(/NIK[^\w_]*([\d?]+)/i) || []
    setResult('nik', nik?.replaceAll('?', 7))
    if (fullRowNIK) sentences = sentences.replace(fullRowNIK, '')

    const [, fullRowNama] = sentences.match(/(Nama[^]*)Tempat/i) || []
    const [, nama] = fullRowNama?.replaceAll('\n', '').trim()
        ?.match(/Nama[^\w_]*([\w\s.]+)/i) || []
    setResult('nama', nama)
    if (fullRowNama) sentences = sentences.replace(fullRowNama, '')

    const [, fullRowTTL] = sentences.match(/(Tempat.*Tgl.*Lahir[^]*)Jenis/i) || []
    const [, tempatLahir, tanggalLahir] = fullRowTTL?.replaceAll('\n', '').trim()
        ?.match(/Tempat.*Tgl.*Lahir[^\w_]*([\w\s]+)[,]*\s*(\d{2}-\d{2}-\d{4})/i) || []
    setResult('tempat_lahir', tempatLahir)
    setResult('tanggal_lahir', tanggalLahir)
    if (fullRowTTL) sentences = sentences.replace(fullRowTTL, '')

    const [, fullRowJKGD] = sentences.match(/(Jenis.*Kelamin[^]*)Alamat/i) || []
    const [, jenisKelamin, golDarah] = fullRowJKGD?.replaceAll('\n', '').trim()
        ?.match(/Jenis.*Kelamin[^\w_]*(laki-laki|perempuan).*Gol.*Darah[^\w_]*(A|B|AB|O)?[+-]?/i) || []
    setResult('jenis_kelamin', jenisKelamin)
    setResult('gol_darah', golDarah)
    if (fullRowJKGD) sentences = sentences.replace(fullRowJKGD, '')

    const [, fullRowAlamat] = sentences.match(/(Alamat[^]*)RT.*RW/i) || []
    const [, alamat] = fullRowAlamat?.replaceAll('\n', '').trim()
        ?.match(/Alamat[^\w_]*([\w\s.\/]+)/i) || []
    setResult('alamat', alamat)
    if (fullRowAlamat) sentences = sentences.replace(fullRowAlamat, '')

    const [, fullRowRtRw] = sentences.match(/(RT.*RW[^]*)Kel.*Desa/i) || []
    const [, rt, rw] = fullRowRtRw?.replaceAll('\n', '').trim()
        ?.match(/RT.*RW[^\w_]*(\d+)\/(\d+)/i) || []
    setResult('rt', rt)
    setResult('rw', rw)
    if (fullRowRtRw) sentences = sentences.replace(fullRowRtRw, '')

    const [, fullRowDesa] = sentences.match(/(Kel.*Desa[^]*)Kecamatan/i) || []
    const [, desa] = fullRowDesa?.replaceAll('\n', '').trim()
        ?.match(/Kel.*Desa[^\w_]*([\w\s]*)/i) || []
    setResult('desa', desa)
    if (fullRowDesa) sentences = sentences.replace(fullRowDesa, '')

    const [, fullRowKecamatan] = sentences.match(/(Kecamatan[^]*)Agama/i) || []
    const [, kecamatan] = fullRowKecamatan?.replaceAll('\n', '').trim()
        ?.match(/Kecamatan[^\w_]*([\w\s]+)/i) || []
    setResult('kecamatan', kecamatan)
    if (fullRowKecamatan) sentences = sentences.replace(fullRowKecamatan, '')

    const [, fullRowAgama] = sentences.match(/(Agama[^]*)Status.*Perkawinan/i) || []
    const [, agama] = fullRowAgama?.replaceAll('\n', '').trim()
        ?.match(/Agama[^\w_]*([\w]+)/i) || []
    setResult('agama', agama)
    if (fullRowAgama) sentences = sentences.replace(fullRowAgama, '')

    const [, fullRowStatusKawin] = sentences.match(/(Status.*Perkawinan[^]*)Pekerjaan/i) || []
    const [, statusPerkawinan] = fullRowStatusKawin?.replaceAll('\n', '').trim()
        ?.match(/Status.*Perkawinan[^\w_]*(BELUM KAWIN|KAWIN)/i) || []
    setResult('status_perkawinan', statusPerkawinan)
    if (fullRowStatusKawin) sentences = sentences.replace(fullRowStatusKawin, '')

    const [, fullRowPekerjaan] = sentences.match(/(Pekerjaan[^]*)Kewarganegaraan/i) || []
    const [, pekerjaan] = fullRowPekerjaan?.replaceAll('\n', '').trim()
        ?.match(/Pekerjaan[^\w_]*([\w\s]+)/i) || []
    setResult('pekerjaan', pekerjaan?.replaceAll('?', 7))
    if (fullRowPekerjaan) sentences = sentences.replace(fullRowPekerjaan, '')

    const [, fullRowKewarganegaraan] = sentences.match(/(Kewarganegaraan[^]*)/i) || []
    const [, kewarganegaraan] = fullRowKewarganegaraan?.match(/Kewarganegaraan[^\w_]*([\w]+)/i) || []
    setResult('kewarganegaraan', kewarganegaraan?.replaceAll('?', 7))
    if (fullRowKewarganegaraan) sentences = sentences.replace(fullRowKewarganegaraan, '')

    return result
}

async function KTPDataExtractor(imagePath, grayscalePath) {
    await sharp(imagePath)
        .grayscale()
        .toFile(grayscalePath);

    const { data: { text } } = await Tesseract.recognize(grayscalePath, 'ind', {
        logger: (info) => console.log(info),
    });

    const sentences = text.split('\n')
        .map(v => v.trim())
        .filter(c => ![null, undefined, ''].includes(c))

    const fixedSentences = sentences.map(v => {
        const words = v.split(/\s+/);
        const correctedWords = words.map((word) => correctWord(word));
        const correctedText = correctedWords.join(' ');
        return correctedText
    })

    const fixedText = fixedSentences.join('\n ')

    const result = extractData(fixedText)
    return {
        text,
        sentences,
        fixedSentences,
        fixedText,
        result
    }
}

module.exports = {
    KTPDataExtractor
}