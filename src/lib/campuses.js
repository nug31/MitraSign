export const CAMPUSES = [
    { name: 'SMK Mitra Industri MM2100', logo: '/logo.png', location: 'Kawasan Industri MM2100' },
    { name: 'SMK Mitra Industri 02', logo: '/logo02.png', location: 'Tayu, Kabupaten Pati' },
    { name: 'SMK Mitra Industri 03', logo: '/logo03.png', location: 'Kabupaten Bekasi' }
];

export const getCampus = (unitName) => {
    if (/\b02\b/.test(unitName || '')) return CAMPUSES[1];
    if (/\b03\b/.test(unitName || '')) return CAMPUSES[2];
    return CAMPUSES[0];
};
