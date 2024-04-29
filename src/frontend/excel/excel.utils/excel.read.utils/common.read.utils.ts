import * as ExcelJS from 'exceljs';
import { HeaderI } from '../enums_constants';
import { SessionInstrument } from 'frontend/graphql.schema';

export class ExcelRead {
  private workbook: ExcelJS.Workbook;
  private headers: HeaderI[];
  private sheetName: string;

  constructor(headerArray: HeaderI[], sheetName: string) {
    this.headers = headerArray;
    this.sheetName = sheetName;
    this.workbook = new ExcelJS.Workbook();
  }

  async loadExcel(data: string) {
    const buffer = Buffer.from(data, 'base64');
    await this.workbook.xlsx.load(buffer);
  }

  readData(): any[] {
    const worksheet = this.workbook.getWorksheet(this.sheetName);
    const headerMap = new Map(
      this.headers.map((header) => [header.header, header.key]),
    );

    const data = [];

    let headerRowNo;
    worksheet.eachRow((row, rowNumber) => {
      if (row.getCell(1).value) {
        if (!headerRowNo) {
          headerRowNo = rowNumber;
          // validate all mandatory headers later.
        } else {
          const rowData: { [key: string]: any } = {};
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const header = worksheet
              .getRow(headerRowNo)
              .getCell(colNumber).value;
            const key = headerMap.get(header as string);
            if (key) {
              rowData[key] = cell.value;
            }
          });
          data.push(rowData);
        }
      }
    });
    return data;
  }

  async getData(fileData: string): Promise<any[]> {
    await this.loadExcel(fileData);
    return this.readData();
  }
}
