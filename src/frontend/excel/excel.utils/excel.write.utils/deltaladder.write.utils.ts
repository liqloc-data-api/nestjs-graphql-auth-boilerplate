import * as ExcelJS from 'exceljs';

import { SessionInstrument } from 'frontend/graphql.schema';
import {
  LiquidInstrumentsMembers,
  SessionCurve,
  SessionOrderDetail,
} from 'graphql.schema';
import {
  HeaderI,
  LIQUID_MATURITY_SYMBOL,
  MetaDataI,
  SheetNameE,
} from '../enums_constants';
import { ExcelWriter } from './common.write.utils';
import { headerFromColumnSettings } from '../excel.common.utils';
import {
  toDeltaLadderBlankTemplate,
  toDeltaLadderDataTemplate,
} from '../excel.transformation.utils/deltaLadder.transformation.utils';

const DELTA_LADDER_EXCEL_CONFIG = {
  lockedColumnIds: [{ name: 'maturity' }],
  dataValidationColumnSettings: [
    {
      name: 'direction',
      values: {
        type: 'list',
        allowBlank: true,
        formulae: ['"Pay, Receive"'],
      },
    },
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

export class DeltaLadderTemplateGenerator {
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
    this.excelSettings = DELTA_LADDER_EXCEL_CONFIG;
    this.metaData = metaData;
  }

  addBlankTemplateData() {
    this.data = toDeltaLadderBlankTemplate(this.sessionInstruments);
  }

  addTemplateData(
    data: SessionOrderDetail[],
    liquidMaturities: LiquidInstrumentsMembers,
  ) {
    this.data = toDeltaLadderDataTemplate(
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
    data: SessionOrderDetail[],
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
      null,
      this.metaData,
    );
    await excelWriter.writeSheet(SheetNameE.DELTA_LADDER);
    return await excelWriter.getExcelAsBuffer();
  }
}
