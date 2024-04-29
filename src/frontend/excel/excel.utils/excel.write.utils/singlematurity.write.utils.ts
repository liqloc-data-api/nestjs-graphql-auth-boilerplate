import * as ExcelJS from 'exceljs';

import { SessionInstrument } from 'frontend/graphql.schema';
import { LiquidInstrumentsMembers, SessionLimit } from 'graphql.schema';

import { ExcelWriter } from './common.write.utils';
import { headerFromColumnSettings } from '../excel.common.utils';
import { ParameterSubTypeIdE } from 'frontend/parameters/enums_constants';
import {
  HeaderI,
  LIQUID_MATURITY_SYMBOL,
  MetaDataI,
  SheetNameE,
} from '../enums_constants';
import {
  SingleMaturityBlankTemplateDataI,
  SingleMaturityTemplateDataI,
  toSingleMaturityBlankTemplate,
  toSingleMaturityDataTemplate,
} from '../excel.transformation.utils/singleMaturity.transformation.utils';

const SINGLE_MATURITY_EXCEL_CONFIG = {
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

export class SingleMaturityTemplateGenerator {
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
    this.excelSettings = SINGLE_MATURITY_EXCEL_CONFIG;
    this.metaData = metaData;
  }

  addBlankTemplateData() {
    this.data = toSingleMaturityBlankTemplate(this.sessionInstruments);
  }

  addTemplateData(
    data: SessionLimit[],
    liquidMaturities: LiquidInstrumentsMembers,
  ) {
    this.data = toSingleMaturityDataTemplate(
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
    data: SessionLimit[],
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
    await excelWriter.writeSheet(SheetNameE.SINGLE_MATURITY);
    return await excelWriter.getExcelAsBuffer();
  }
}
