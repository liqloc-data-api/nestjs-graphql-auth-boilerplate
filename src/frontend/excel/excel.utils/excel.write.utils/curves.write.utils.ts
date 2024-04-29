import * as ExcelJS from 'exceljs';

import { SessionInstrument } from 'frontend/graphql.schema';
import { LiquidInstrumentsMembers, SessionCurve } from 'graphql.schema';
import { HeaderI, MetaDataI, SheetNameE } from '../enums_constants';
import { ExcelWriter } from './common.write.utils';
import { headerFromColumnSettings } from '../excel.common.utils';
import {
  toCurveBlankTemplate,
  toCurveTemplate,
} from '../excel.transformation.utils/curve.transformation.utils';

const CURVE_EXCEL_CONFIG = {
  lockedColumnIds: [{ name: 'maturity' }, { name: 'maturity_date' }],
  dataValidationColumnSettings: [
    {
      name: 'liquid_maturity_flag',
      values: {
        type: 'list',
        allowBlank: true,
        formulae: ['"Y,"'],
      },
    },
  ],
};

export class CurvesTemplateGenerator {
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
    this.excelSettings = CURVE_EXCEL_CONFIG;
    this.metaData = metaData;
  }

  addBlankTemplateData() {
    this.data = toCurveBlankTemplate(this.sessionInstruments);
  }

  addTemplateData(
    data: SessionCurve[],
    liquidMaturities: LiquidInstrumentsMembers,
  ) {
    this.data = toCurveTemplate(
      this.sessionInstruments,
      data,
      liquidMaturities,
    );
  }

  async generateBlankTemplate() {
    this.addBlankTemplateData();
    return await this.writeExcel();
  }

  async generateTemplateWithData(
    data: SessionCurve[],
    liquidMaturities: LiquidInstrumentsMembers,
  ) {
    this.addTemplateData(data, liquidMaturities);
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
    await excelWriter.writeSheet(SheetNameE.CURVES);
    return await excelWriter.getExcelAsBuffer();
  }
}
