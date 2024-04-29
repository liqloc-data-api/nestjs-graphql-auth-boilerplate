import { SessionInstrument } from 'frontend/graphql.schema';
import { HeaderI, MetaDataI, SheetNameE } from '../enums_constants';
import { ExcelWriter } from './common.write.utils';
import { headerFromColumnSettings } from '../excel.common.utils';
import { SessionOrder } from 'graphql.schema';
import { SubOrderTypeIdE } from 'frontend/orders/enums_constants';
import {
  MarketMakingBlankTemplateDataI,
  MarketMakingTemplateDataI,
  MarketMakingTypeE,
  toMarketMakingDataTemplate,
  toSingleMaturityBlankTemplate,
} from '../excel.transformation.utils/marketMaking.transformation.utils';

const MARKET_MAKING_EXCEL_CONFIG = {
  lockedColumnIds: [
    {
      name: 'type',
      condition: [{ column: 'type', values: [MarketMakingTypeE.SM] }],
    },
    {
      name: 'maturity1',
      condition: [{ column: 'type', values: [MarketMakingTypeE.SM] }],
    },
    {
      name: 'maturity2',
      condition: [{ column: 'type', values: [MarketMakingTypeE.SM] }],
    },
    {
      name: 'maturity3',
      condition: [{ column: 'type', values: [MarketMakingTypeE.SM] }],
    },
  ],
  dataValidationColumnSettings: [
    {
      name: 'type',
      values: {
        type: 'list',
        allowBlank: true,
        formulae: ['"Spread,Fly"'],
      },
    },
    {
      name: 'maturity1',
      values: {
        type: 'list',
        allowBlank: true,
        formulae: ['InstrumentValidationList'],
      },
    },
    {
      name: 'maturity2',
      values: {
        type: 'list',
        allowBlank: true,
        formulae: ['InstrumentValidationList'],
      },
    },
    {
      name: 'maturity3',
      values: {
        type: 'list',
        allowBlank: true,
        formulae: ['InstrumentValidationList'],
      },
    },
  ],
  addRows: 50,
};

export class MarketMakingTemplateGenerator {
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
    this.excelSettings = MARKET_MAKING_EXCEL_CONFIG;
    this.metaData = metaData;
  }

  addBlankTemplateData() {
    this.data = toSingleMaturityBlankTemplate(this.sessionInstruments);
  }

  addTemplateData(data: SessionOrder[]) {
    this.data = toMarketMakingDataTemplate(this.sessionInstruments, data);
  }

  async generateBlankTemplate() {
    this.addBlankTemplateData();
    return await this.writeExcel();
  }

  async generateTemplateWithData(data: SessionOrder[]) {
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
    await excelWriter.writeSheet(SheetNameE.MARKET_MAKING);
    return await excelWriter.getExcelAsBuffer();
  }
}
