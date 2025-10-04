import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export async function exportToXLSX(data: Array<Record<string, unknown>>, filename: string, sheetName: string = "Data") {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (data.length === 0) {
    throw new Error("No data to export");
  }

  // Get column headers from first object
  const headers = Object.keys(data[0]);
  
  // Add headers with styling
  worksheet.columns = headers.map((header) => ({
    header: header.charAt(0).toUpperCase() + header.slice(1).replace(/_/g, " "),
    key: header,
    width: 20,
  }));

  // Style header row
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F46E5" }, // Indigo
  };
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  // Add data rows
  data.forEach((item) => {
    const row = worksheet.addRow(item);
    row.alignment = { vertical: "middle" };
  });

  // Auto-fit columns based on content
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = Math.min(maxLength + 2, 50);
  });

  // Add borders
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}.xlsx`);
}

export async function exportMultiSheetXLSX(
  sheets: Array<{ name: string; data: Array<Record<string, unknown>> }>,
  filename: string
) {
  const workbook = new ExcelJS.Workbook();

  for (const sheet of sheets) {
    if (sheet.data.length === 0) continue;

    const worksheet = workbook.addWorksheet(sheet.name);
    const headers = Object.keys(sheet.data[0]);

    // Add headers
    worksheet.columns = headers.map((header) => ({
      header: header.charAt(0).toUpperCase() + header.slice(1).replace(/_/g, " "),
      key: header,
      width: 20,
    }));

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };

    // Add data
    sheet.data.forEach((item) => {
      worksheet.addRow(item);
    });

    // Borders
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}.xlsx`);
}

export function exportToCSV(data: Array<Record<string, unknown>>, filename: string) {
  if (data.length === 0) {
    throw new Error("No data to export");
  }

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${filename}.csv`);
}
