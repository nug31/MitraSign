// Menyisipkan chunk pHYs ke PNG supaya software cetak/Word/PDF membaca ukuran fisiknya (cm)
// dan menempelkan gambar langsung pada ukuran yang benar.

let crcTable;
const crc32 = (bytes) => {
    if (!crcTable) {
        crcTable = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            crcTable[n] = c >>> 0;
        }
    }
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
};

export const pngDataUrlWithDpi = (dataUrl, dpi) => {
    const bin = atob(dataUrl.split(',')[1]);
    const png = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) png[i] = bin.charCodeAt(i);

    const ppm = Math.round(dpi / 0.0254);
    const chunk = new Uint8Array(21); // length(4) + type(4) + data(9) + crc(4)
    const view = new DataView(chunk.buffer);
    view.setUint32(0, 9);
    chunk.set([0x70, 0x48, 0x59, 0x73], 4); // "pHYs"
    view.setUint32(8, ppm);
    view.setUint32(12, ppm);
    chunk[16] = 1; // satuan: meter
    view.setUint32(17, crc32(chunk.subarray(4, 17)));

    // salin chunk PNG satu per satu, buang pHYs lama, sisipkan yang baru setelah IHDR
    const parts = [png.subarray(0, 8)];
    const pv = new DataView(png.buffer);
    let pos = 8;
    while (pos < png.length) {
        const len = pv.getUint32(pos);
        const type = String.fromCharCode(...png.subarray(pos + 4, pos + 8));
        const end = pos + 12 + len;
        if (type !== 'pHYs') parts.push(png.subarray(pos, end));
        if (type === 'IHDR') parts.push(chunk);
        pos = end;
    }
    return URL.createObjectURL(new Blob(parts, { type: 'image/png' }));
};
