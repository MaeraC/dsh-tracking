import { utils, writeFile } from 'xlsx';

/**
 * Exporte les données en fichier Excel.
 * 
 * @param {Array<Object>} data - Les données à exporter.
 * @param {string} fileName - Le nom du fichier Excel.
 * @param {Array<string>} sheetNames - Les noms des feuilles de calcul.
 * @param {Array<Object>} sheetsData - Les données pour chaque feuille de calcul.
 */

export const exportToExcel = (data, fileName, sheetNames, sheetsData) => {
    // Créer un nouveau classeur
    const workbook = utils.book_new();

    // Ajouter les feuilles de calcul au classeur
    sheetsData.forEach((sheetData, index) => {
        const worksheet = utils.json_to_sheet(sheetData);

        // Appliquer le formatage aux en-têtes
        const headerRange = utils.decode_range(worksheet['!ref']);
        for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
            const cellAddress = utils.encode_cell({ c: C, r: 0 });
            if (!worksheet[cellAddress]) continue;
            worksheet[cellAddress].s = { font: { bold: true } };
        }

        utils.book_append_sheet(workbook, worksheet, sheetNames[index]);
    });

    // Écrire le classeur en tant que fichier Excel
    writeFile(workbook, fileName);
};


export default exportToExcel;


