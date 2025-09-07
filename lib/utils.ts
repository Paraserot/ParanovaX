
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from "date-fns";
import * as XLSX from 'xlsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function printAsPdf(title: string, head: any[], body: any[]) {
    const doc = new jsPDF();

    (doc as any).autoTable({
        head: head,
        body: body,
        theme: 'grid',
        headStyles: {
            fillColor: [128, 0, 128], // Purple for table header
            textColor: [255, 255, 255],
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [248, 249, 250]
        },
        styles: {
            cellPadding: 3,
            fontSize: 8,
            valign: 'middle'
        },
        didDrawPage: (data: any) => {
            // Header
            const headerY = 25;
            const headerColor = [12, 12, 38]; // Very dark blue/purple
            doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
            doc.rect(0, 0, doc.internal.pageSize.width, headerY, 'F');
            
            // Title
            const titleY = 18;
            const titleWords = title.split(' ');
            const lastWord = titleWords.pop() || '';
            const mainTitle = titleWords.join(' ');
            
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            
            const mainTitleWidth = doc.getTextWidth(mainTitle);
            const margin = data.settings.margin.left;
            doc.text(mainTitle, margin, titleY);

            // Highlighted last word
            const pinkColor = [224, 6, 122]; // Your app's primary pink color
            doc.setTextColor(pinkColor[0], pinkColor[1], pinkColor[2]);
            doc.text(lastWord, margin + mainTitleWidth + 2, titleY);


            // Footer
            const footerY = doc.internal.pageSize.height - 10;
            const pageCount = doc.internal.getNumberOfPages();
            
            // Page number and generation date
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            const genDate = format(new Date(), "dd/MM/yyyy HH:mm:ss");
            doc.text(`Page ${data.pageNumber} of ${pageCount} | Generated On: ${genDate}`, margin, footerY);

            // Brand name
            const brandText = "Paranova";
            const brandX = "X";
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const brandTextX = doc.internal.pageSize.width - margin;
            const brandTextWidth = doc.getTextWidth(brandText);
            const brandXWidth = doc.getTextWidth(brandX);

            doc.setTextColor(0, 0, 0); // Black for "Paranova"
            doc.text(brandText, brandTextX - brandXWidth, footerY, { align: 'right' });
            
            doc.setTextColor(pinkColor[0], pinkColor[1], pinkColor[2]); // Pink for "X"
            doc.text(brandX, brandTextX, footerY, { align: 'right' });
        },
        margin: { top: 30 }
    });
    doc.save(`${title.replace(/\s+/g, '_')}_Report.pdf`);
}

export function printAsXlsx(fileName: string, header: string[], body: any[][]) {
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);

    // Style header row
    const headerStyle = { font: { bold: true } };
    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (worksheet[address]) {
            worksheet[address].s = headerStyle;
        }
    }
    
    // Auto-fit columns
    const colWidths = header.map((h, i) => ({ wch: Math.max(h.length, ...body.map(row => String(row[i] || '').length)) + 2 }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, fileName);
    XLSX.writeFile(workbook, `${fileName.replace(/\s+/g, '_')}_Report.xlsx`);
};
