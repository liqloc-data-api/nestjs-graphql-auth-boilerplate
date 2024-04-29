import { SessionInstrument } from "graphql.schema";
import { HeaderI } from "../enums_constants";
import { headerFromColumnSettings } from "../excel.common.utils";
import { DateRangeTemplateDataI, toDBDateRangeFormat } from "../excel.transformation.utils/dateRange.transformation.utils";
import { ExcelRead } from "./common.read.utils";
import { MultiSessionDateRangeLimit, MultiSessionOrderDetail } from "frontend/graphql.schema";



export class DateRangeExcelReader {
    private fileData: string;
    private headers: HeaderI[];
    private sheetName: string;
    rawData: DateRangeTemplateDataI[];
    
    constructor(fileData: string, columnSettings: any, sheetName: string) {
        this.fileData = fileData;
        this.headers = headerFromColumnSettings(columnSettings);
        this.sheetName = sheetName;
    }
    
    async getExcelDateRangeData(): Promise<void> {
        const excelReaderObj = new ExcelRead(this.headers, this.sheetName);
        this.rawData = await excelReaderObj.getData(this.fileData);
    }
    
    async getMultiDateRangeData(
        sessionId: number,
        bookId: number,
        traderId: number,
        userId: number,
        instrumentMap: Map<string, SessionInstrument>,
    ): Promise<MultiSessionDateRangeLimit[]> {
        await this.getExcelDateRangeData();
        const formattedData: MultiSessionDateRangeLimit[] = toDBDateRangeFormat(
            sessionId,
            bookId,
            traderId,
            this.rawData,
            instrumentMap,
            userId,
        );
        return formattedData;
    }
}