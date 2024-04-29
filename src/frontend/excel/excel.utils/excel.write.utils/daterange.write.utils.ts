import * as ExcelJS from 'exceljs';

import { SessionInstrument } from 'frontend/graphql.schema';
import {
  LiquidInstrumentsMembers,
  SessionCurve,
  SessionLimit,
} from 'graphql.schema';
import { HeaderI, MetaDataI, SheetNameE } from '../enums_constants';
import { ExcelWriter } from './common.write.utils';
import { headerFromColumnSettings } from '../excel.common.utils';
import {
  DateRangeTemplateDataI,
  toDateRangeDataTemplate,
} from '../excel.transformation.utils/dateRange.transformation.utils';

const DATE_RANGE_EXCEL_CONFIG = {
  lockedColumnIds: [],
  dataValidationColumnSettings: [
    {
      name: 'maturity_start',
      values: {
        type: 'list',
        allowBlank: true,
        formulae: ['InstrumentValidationList'],
      },
    },
    {
      name: 'maturity_end',
      values: {
        type: 'list',
        allowBlank: true,
        formulae: ['InstrumentValidationList'],
      },
    },
  ],
  addRows: 20,
};

export class DateRangeTemplateGenerator {
  private sessionInstruments: SessionInstrument[];
  private header: HeaderI[];
  private excelSettings: any;
  private data: object[];
  private metaData: MetaDataI;

  constructor(
    sessionInstruments: SessionInstrument[],
    columnSettings: any,
    metaData: MetaDataI,
  ) {
    this.header = headerFromColumnSettings(columnSettings);
    this.sessionInstruments = sessionInstruments;
    this.excelSettings = DATE_RANGE_EXCEL_CONFIG;
    this.metaData = metaData;
  }

  addBlankTemplateData() {
    this.data = [];
  }

  addTemplateData(data: SessionLimit[]) {
    this.data = toDateRangeDataTemplate(this.sessionInstruments, data);
  }

  async generateBlankTemplate() {
    this.addBlankTemplateData();
    return await this.writeExcel();
  }

  async generateTemplateWithData(data: SessionLimit[]) {
    this.addTemplateData(data);
    return await this.writeExcel();
  }

  async writeExcel() {
    const excelWriter = new ExcelWriter(
      this.header,
      this.data,
      this.excelSettings,
      this.sessionInstruments,
      this.metaData,
    );
    await excelWriter.writeSheet(SheetNameE.DATE_RANGE);
    return await excelWriter.getExcelAsBuffer();
  }
}
