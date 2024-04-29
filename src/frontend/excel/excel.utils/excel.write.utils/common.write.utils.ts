import * as lodash from 'lodash';
import * as ExcelJS from 'exceljs';
import { HeaderI, MetaDataI } from '../enums_constants';
import { SessionInstrument } from 'frontend/graphql.schema';

export class ExcelWriter {
  private headerArray: HeaderI[];
  private data: object[];
  private excelSettings: any;
  private workbook: ExcelJS.Workbook;
  private sessionInstruments: SessionInstrument[];
  private metaData: MetaDataI;
  constructor(
    headerArray: HeaderI[],
    data: object[],
    excelSettings: any,
    sessionInstruments?: SessionInstrument[],
    metaData?: MetaDataI,
  ) {
    this.headerArray = headerArray;
    this.data = data;
    this.workbook = new ExcelJS.Workbook();
    this.excelSettings = excelSettings;
    this.sessionInstruments = sessionInstruments;
    this.metaData = metaData;
  }

  async getExcelAsBuffer(): Promise<Buffer> {
    return (await this.workbook.xlsx.writeBuffer()) as Buffer;
  }

  async writeSheet(name: string): Promise<void> {
    const worksheet = this.workbook.addWorksheet(name);
    worksheet.columns = this.headerArray;
    this.data.forEach((row) => {
      worksheet.addRow(row);
    });
    this.sheetFormatter(worksheet, this.excelSettings.addRows, this.metaData); // Always call this after writing data
    // Temp writing for testing
    await this.workbook.xlsx.writeFile(name + '.xlsx');
  }

  sheetFormatter(
    worksheet: ExcelJS.Worksheet,
    addRows?: number,
    metaData?: MetaDataI,
  ) {
    if (this.sessionInstruments) {
      this.addSessionInstrumentValidationList(this.sessionInstruments);
    }
    this.baseFormatter(worksheet, addRows);

    for (const columnLockSetting of this.excelSettings.lockedColumnIds) {
      this.lockCellFormatting(worksheet, columnLockSetting);
    }

    for (const columnSetting of this.excelSettings
      .dataValidationColumnSettings) {
      this.dataValidationFormatting(worksheet, columnSetting);
    }

    this.headerFormatting(worksheet);

    metaData && this.addMetaDataOnTop(worksheet, metaData);

    // Re-lock cells in the specific column you want to protect
    worksheet.protect('', {});
  }

  private baseFormatter(worksheet: ExcelJS.Worksheet, addRows: number) {
    const noOfRows = addRows
      ? addRows + worksheet.rowCount
      : worksheet.rowCount;
    for (let i = 1; i <= this.headerArray.length; i++) {
      for (let j = 1; j <= noOfRows; j++) {
        worksheet.getRow(j).getCell(i).protection = { locked: false };
        worksheet.getRow(j).getCell(i).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFdbdbdb' }, // Light gray fill
        };
        worksheet.getRow(j).getCell(i).border = {
          top: { style: 'dotted', color: { argb: 'FFF2F2F2' } },
          left: { style: 'dotted', color: { argb: 'FFF2F2F2' } },
          bottom: { style: 'dotted', color: { argb: 'FFF2F2F2' } },
          right: { style: 'dotted', color: { argb: 'FFF2F2F2' } },
        };
      }
    }
  }

  private lockCellFormatting(
    worksheet: ExcelJS.Worksheet,
    columnLockSetting: any,
  ) {
    const isCheckCondition =
      columnLockSetting.condition && columnLockSetting.condition.length > 0
        ? true
        : false;

    try {
      worksheet
        .getColumn(columnLockSetting.name)
        .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
          const conditionBool: boolean = isCheckCondition
            ? columnLockSetting.condition.some((condition) => {
                const conditionCell = worksheet
                  .getRow(rowNumber)
                  .getCell(condition.column);
                return condition.values.includes(conditionCell.value);
              })
            : true;
          if (conditionBool) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF525252' }, // Light gray color
            };
            cell.font = {
              color: { argb: 'FFFFFFFF' }, // White text
              size: 10, // Example font size, adjust as necessary
            };
            cell.protection = {
              locked: true,
            };
          }
        });
    } catch (error) {
      if (!error.message.includes('Out of bounds')) {
        throw error;
      }
    }
  }

  private dataValidationFormatting(
    worksheet: ExcelJS.Worksheet,
    columnSetting: any,
  ) {
    worksheet
      .getColumn(columnSetting.name)
      .eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber > 1) {
          // Skip the header row
          cell.dataValidation = columnSetting.values;
        }
      });
  }

  private headerFormatting(worksheet: ExcelJS.Worksheet) {
    const headerRow = worksheet.getRow(1);
    let headerHeight = 20;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF262626' }, // Dark gray fill
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' }, // White text
        size: 10, // Example font size, adjust as necessary
        bold: true,
      };
      cell.protection = {
        locked: true,
      };
      cell.alignment = { wrapText: true };
      // setting height of header row
      headerHeight = Math.max(
        headerHeight,
        Math.ceil(cell.value.toString().length / 15) * 20,
      );
    });
    headerRow.height = headerHeight;
  }

  private addMetaDataOnTop(worksheet: ExcelJS.Worksheet, metaData: MetaDataI) {
    const workbook = worksheet.workbook;
    const dataPointCount = Object.keys(metaData).length;
    worksheet.insertRows(
      1,
      Array.from({ length: dataPointCount + 2 }, () => []),
    );
    worksheet.getRow(1).height = 20;
    for (const [index, [key, value]] of Object.entries(metaData).entries()) {
      const nameCellRef = `B${index + 2}`;
      const nameCell = worksheet.getCell(nameCellRef);
      nameCell.value = value.name;
      nameCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF525252' }, // Light gray color
      };
      nameCell.font = {
        color: { argb: 'FFFFFFFF' }, // White text
        size: 10, // Example font size, adjust as necessary
      };
      nameCell.protection = {
        locked: true,
      };
      nameCell.border = {
        top: { style: 'dotted', color: { argb: 'FFF2F2F2' } },
        left: { style: 'dotted', color: { argb: 'FFF2F2F2' } },
        bottom: { style: 'dotted', color: { argb: 'FFF2F2F2' } },
        right: { style: 'dotted', color: { argb: 'FFF2F2F2' } },
      };
      const valueCellRef = `C${index + 2}`;
      const valueCell = worksheet.getCell(valueCellRef);
      valueCell.value = value.value;
      valueCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFdbdbdb' }, // Light gray color
      };
      valueCell.protection = {
        locked: true,
      };
      valueCell.border = {
        top: { style: 'dotted', color: { argb: 'FFF2F2F2' } },
        left: { style: 'dotted', color: { argb: 'FFF2F2F2' } },
        bottom: { style: 'dotted', color: { argb: 'FFF2F2F2' } },
        right: { style: 'dotted', color: { argb: 'FFF2F2F2' } },
      };
      workbook.definedNames.add(key, `${worksheet.name}!${valueCellRef}`);
    }
  }

  private addSessionInstrumentValidationList(
    sessionInstruments: SessionInstrument[],
  ) {
    // add sessionInstrument symbols to new sheet and make it defined names for data validation and hide the sheet.
    const worksheet = this.workbook.addWorksheet('ValidationList');
    worksheet.getColumn('A').values = sessionInstruments.map((instrument) => {
      return instrument.symbol;
    });
    // Define a name for the range of cells in column A
    const range = `ValidationList!A1:A${sessionInstruments.length}`;
    this.workbook.definedNames.add(range, 'InstrumentValidationList');
    worksheet.state = 'hidden';
  }
}
