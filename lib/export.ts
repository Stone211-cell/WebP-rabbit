import * as XLSX from 'xlsx';
import { formatThaiDate } from './utils';

export const exportToExcel = (data: any[], filename: string) => {
    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Save to file
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(dataBlob);

    // Add date to filename
    const dateStr = formatThaiDate(new Date(), 'dd-MM-yyyy_HHmm');
    link.download = `${filename}_${dateStr}.xlsx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
