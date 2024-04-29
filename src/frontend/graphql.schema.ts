
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum RateUnit {
    BASIS_POINT = "BASIS_POINT",
    PERCENTAGE = "PERCENTAGE"
}

export enum PriceType {
    PREMIUM_TO_MID = "PREMIUM_TO_MID",
    SPREAD_TO_MID = "SPREAD_TO_MID"
}

export enum AmountType {
    DV01 = "DV01",
    NOTIONAL = "NOTIONAL"
}

export enum Direction {
    Receive = "Receive",
    Pay = "Pay"
}

export enum BreachDirection {
    Receive = "Receive",
    Pay = "Pay",
    Both = "Both"
}

export interface CustomMembersInput {
    _custom_column_1?: Nullable<Any>;
    _custom_column_2?: Nullable<Any>;
    _custom_column_3?: Nullable<Any>;
    _custom_column_4?: Nullable<Any>;
    _custom_column_5?: Nullable<Any>;
    _custom_column_6?: Nullable<Any>;
    _custom_column_7?: Nullable<Any>;
    _custom_column_8?: Nullable<Any>;
    _custom_column_9?: Nullable<Any>;
    _custom_column_10?: Nullable<Any>;
}

export interface InstrumentMembersInput {
    startDate?: Nullable<string>;
    maturityDate: string;
    numberOfPeriods?: Nullable<number>;
    floatingRateIndex?: Nullable<string>;
}

export interface CurveMembersInput {
    dv01: number;
    pv01: number;
    rate_adj?: Nullable<number>;
    mid_market_rate: number;
    mid_market_rate_unit?: Nullable<RateUnit>;
    rate_adj_unit?: Nullable<RateUnit>;
}

export interface SessionCurveInput {
    instrument_id?: Nullable<number>;
    book_id?: Nullable<number>;
    trader_id?: Nullable<number>;
    session_id?: Nullable<number>;
    curve_members: CurveMembersInput;
    custom_members?: Nullable<CustomMembersInput>;
}

export interface MultiSessionCurveInput {
    session_id: number;
    book_id: number;
    trader_id: number;
    instrument_id: number;
    curve_members: CurveMembersInput;
    custom_members?: Nullable<JSON>;
    updated_by: number;
}

export interface SingleMaturityDOMembers {
    instrument_id1: number;
    direction: Direction;
    amount: number;
    price: number;
    fo_amount?: Nullable<number>;
    fo_price?: Nullable<number>;
    instrument_id1_min?: Nullable<number>;
    instrument_id1_max?: Nullable<number>;
    liquidity_premium?: Nullable<number>;
    price_type?: Nullable<PriceType>;
    amount_type?: Nullable<AmountType>;
}

export interface SpreadDOMembers {
    instrument_id1: number;
    instrument_id2: number;
    direction: Direction;
    amount: number;
    price: number;
    fo_amount?: Nullable<number>;
    fo_price?: Nullable<number>;
    instrument_id1_min?: Nullable<number>;
    instrument_id1_max?: Nullable<number>;
    instrument_id2_min?: Nullable<number>;
    instrument_id2_max?: Nullable<number>;
    liquidity_premium?: Nullable<number>;
    price_type?: Nullable<PriceType>;
    amount_type?: Nullable<AmountType>;
}

export interface FlyDOMembers {
    instrument_id1: number;
    instrument_id2: number;
    instrument_id3: number;
    direction: Direction;
    amount: number;
    price: number;
    fo_amount?: Nullable<number>;
    fo_price?: Nullable<number>;
    instrument_id1_min?: Nullable<number>;
    instrument_id1_max?: Nullable<number>;
    instrument_id2_min?: Nullable<number>;
    instrument_id2_max?: Nullable<number>;
    instrument_id3_min?: Nullable<number>;
    instrument_id3_max?: Nullable<number>;
    liquidity_premium?: Nullable<number>;
    price_type?: Nullable<PriceType>;
    amount_type?: Nullable<AmountType>;
}

export interface AnyOfDOMembersOrderDetails {
    instrument_id1: number;
    price: number;
    fo_price?: Nullable<number>;
    instrument_id1_min?: Nullable<number>;
    instrument_id1_max?: Nullable<number>;
}

export interface AnyOfDOMembers {
    amount: number;
    direction: Direction;
    fo_amount?: Nullable<number>;
    liquidity_premium?: Nullable<number>;
    order_details: AnyOfDOMembersOrderDetails[];
    price_type?: Nullable<PriceType>;
    amount_type?: Nullable<AmountType>;
}

export interface AllOfDOMembersOrderDetails {
    instrument_id1: number;
    amount: number;
    price: number;
    direction: Direction;
    fo_amount?: Nullable<number>;
    fo_price?: Nullable<number>;
    instrument_id1_min?: Nullable<number>;
    instrument_id1_max?: Nullable<number>;
}

export interface AllOfDOMembers {
    liquidity_premium?: Nullable<number>;
    order_details: AllOfDOMembersOrderDetails[];
    price_type?: Nullable<PriceType>;
    amount_type?: Nullable<AmountType>;
}

export interface TagAlongDOMembers {
    instrument_id1: number;
    amount: number;
    direction: Direction;
    liquidity_threshold: number;
}

export interface DeltaLadderOrderMembers {
    liquidity_premium?: Nullable<number>;
    move_to_liquid_maturity?: Nullable<boolean>;
}

export interface DeltaLadderOrderDetailMembers {
    amount: number;
    price?: Nullable<number>;
    direction: Direction;
    preserve_amount?: Nullable<number>;
    price_type?: Nullable<PriceType>;
    amount_type?: Nullable<AmountType>;
}

export interface SingleMaturityMMOrderMembers {
    instrument_id1: number;
    pay_amount: number;
    receive_amount: number;
    pay_price: number;
    receive_price: number;
    fo_pay_amount?: Nullable<number>;
    fo_receive_amount?: Nullable<number>;
    fo_pay_price?: Nullable<number>;
    fo_receive_price?: Nullable<number>;
    price_type?: Nullable<PriceType>;
    amount_type?: Nullable<AmountType>;
}

export interface SpreadMMOrderMembers {
    instrument_id1: number;
    instrument_id2: number;
    pay_amount: number;
    receive_amount: number;
    pay_price: number;
    receive_price: number;
    fo_pay_amount?: Nullable<number>;
    fo_receive_amount?: Nullable<number>;
    fo_pay_price?: Nullable<number>;
    fo_receive_price?: Nullable<number>;
    price_type?: Nullable<PriceType>;
    amount_type?: Nullable<AmountType>;
}

export interface FlyMMOrderMembers {
    instrument_id1: number;
    instrument_id2: number;
    instrument_id3: number;
    pay_amount: number;
    receive_amount: number;
    pay_price: number;
    receive_price: number;
    fo_pay_amount?: Nullable<number>;
    fo_receive_amount?: Nullable<number>;
    fo_pay_price?: Nullable<number>;
    fo_receive_price?: Nullable<number>;
    price_type?: Nullable<PriceType>;
    amount_type?: Nullable<AmountType>;
}

export interface RuleBasedMMOrderMembers {
    instrument_subtype_ids: Nullable<number>[];
    liquid_instruments: boolean;
    instrument_id_min: number;
    instrument_id_max: number;
    fraction_of_spread: number;
}

export interface SessionMultiOrder {
    session_id: number;
    book_id: number;
    trader_id: number;
    order_subtype_id: number;
    order_key?: Nullable<string>;
    order_members: JSON;
    custom_members?: Nullable<JSON>;
    updated_by: number;
}

export interface MultiSessionOrderDetail {
    order_id: number;
    session_id: number;
    instrument_id: number;
    order_detail_members: DeltaLadderOrderDetailMembers;
    custom_members?: Nullable<JSON>;
    updated_by: number;
}

export interface MultiSessionLimit {
    parameter_subtype_id: number;
    session_id: number;
    book_id: number;
    trader_id: number;
    parameter_key?: Nullable<string>;
    parameter_members: JSON;
    custom_members?: Nullable<JSON>;
    updated_by: number;
}

export interface SingleMaturityLimitMembers {
    instrument_id: number;
    max_pay_limit: number;
    max_receive_limit: number;
    unit?: Nullable<AmountType>;
}

export interface MultiSessionSingleMaturityLimit {
    parameter_subtype_id: number;
    session_id: number;
    book_id: number;
    trader_id: number;
    parameter_key?: Nullable<string>;
    parameter_members: SingleMaturityLimitMembers;
    custom_members?: Nullable<JSON>;
    updated_by: number;
}

export interface DateRangeLimitMembers {
    instrument_id_min: number;
    instrument_id_max: number;
    max_pay_limit: number;
    max_receive_limit: number;
    unit?: Nullable<AmountType>;
}

export interface MultiSessionDateRangeLimit {
    parameter_subtype_id: number;
    session_id: number;
    book_id: number;
    trader_id: number;
    parameter_key?: Nullable<string>;
    parameter_members: DateRangeLimitMembers;
    custom_members?: Nullable<JSON>;
    updated_by: number;
}

export interface SingleMaturityLimitSettingMembers {
    order_type_ids: Nullable<number>[];
}

export interface Bucket {
    name: string;
    instrument_ids: number[];
}

export interface BucketPairLimit {
    near_bucket_name: string;
    far_bucket_name: string;
    limit: number;
    direction: Direction;
    inferred: boolean;
}

export interface RelativeDateLimitMembers {
    buckets: Bucket[];
    bucket_pair_limits: BucketPairLimit[];
    unit?: Nullable<AmountType>;
}

export interface RelativeDateLimitSettingMembers {
    bucket_end_instrument_ids: Nullable<number>[];
    multiplier: number;
}

export interface OtherParametersMembers {
    value: number;
}

export interface OtherParametersMembersWithSubId {
    parameter_subtype_id: number;
    parameter_member: OtherParametersMembers;
}

export interface OtherParametersMembersWithId {
    parameter_id: number;
    parameter_member: OtherParametersMembers;
}

export interface LiquidInstrumentsMembers {
    instrument_ids: Nullable<number>[];
}

export interface DlNetDV01RangeMembers {
    min_limit: number;
    max_limit: number;
    order_id: number;
    inferred?: Nullable<boolean>;
    unit?: Nullable<AmountType>;
}

export interface SessionInput {
    product_id: number;
    session_name: string;
    session_date: DateYYYYMMDD;
    session_time: string;
    session_state: string;
    meta_data?: Nullable<string>;
}

export interface MMWJson {
    FSS?: Nullable<FSSQuote>;
    OrderTypeState?: Nullable<OrderTypeState>;
    Liquid?: Nullable<AutoQuote>;
    OtherSpotDates?: Nullable<AutoQuote>;
    IMMRange?: Nullable<IMMRangeDep>;
    IMMDates?: Nullable<AutoQuote>;
    PairsFlies?: Nullable<PairsFliesAutoQuoteDep>;
    FollowONTenors?: Nullable<TenorSetting>;
    FollowONOrders?: Nullable<FollowONOrdersDep>;
    Limits?: Nullable<LimitsSettingDep>;
    LiquidRows?: Nullable<Nullable<QuoteRow>[]>;
    SpotRows?: Nullable<Nullable<QuoteRow>[]>;
    DummyDataCopy?: Nullable<DummyDataCopy>;
}

export interface IMMRangeDep {
    autoQuoteRange?: Nullable<Nullable<number>[]>;
}

export interface PairsFliesAutoQuoteDep {
    pairs?: Nullable<number>;
    flies?: Nullable<number>;
    tenors?: Nullable<TenorSetting>;
    autoQuoteRange?: Nullable<Nullable<number>[]>;
}

export interface FollowONOrdersDep {
    liquidNotional?: Nullable<number>;
    liquidSpread?: Nullable<number>;
    spotNotional?: Nullable<number>;
    spotSpread?: Nullable<number>;
    immNotional?: Nullable<number>;
    immSpread?: Nullable<number>;
}

export interface LimitsSettingDep {
    SMLimit?: Nullable<boolean>;
    bucketLimit?: Nullable<number>;
}

export interface OrderTypeState {
    spot?: Nullable<boolean>;
    imm?: Nullable<boolean>;
    pairFly?: Nullable<boolean>;
    fss?: Nullable<boolean>;
    followOn?: Nullable<boolean>;
}

export interface AutoQuote {
    deep?: Nullable<number>;
    wide?: Nullable<number>;
    updatedType?: Nullable<string>;
}

export interface PairsFliesQuote {
    pairsSpreadFraction?: Nullable<number>;
    fliesSpreadFraction?: Nullable<number>;
    tenors?: Nullable<TenorSetting>;
    autoQuoteRange?: Nullable<Nullable<number>[]>;
}

export interface FSSQuote {
    fss?: Nullable<number>;
    tenors?: Nullable<TenorSetting>;
    autoQuoteRange?: Nullable<Nullable<number>[]>;
}

export interface TenorSetting {
    Liquid?: Nullable<boolean>;
    Spot?: Nullable<boolean>;
    IMM?: Nullable<boolean>;
}

export interface FollowOnOrders {
    tenors?: Nullable<TenorSetting>;
    Liquid?: Nullable<FollowOnQuote>;
    Spot?: Nullable<FollowOnQuote>;
    IMM?: Nullable<FollowOnQuote>;
}

export interface FollowOnQuote {
    notional?: Nullable<number>;
    spread?: Nullable<number>;
}

export interface LimitSettings {
    inferSingleMaturityLimits?: Nullable<boolean>;
    relativeDateRangeBuckets?: Nullable<number>;
}

export interface QuoteRow {
    pay?: Nullable<number>;
    receive?: Nullable<number>;
    wide?: Nullable<number>;
    id?: Nullable<string>;
    refID?: Nullable<string>;
    active?: Nullable<boolean>;
    payManuallyEdited?: Nullable<boolean>;
    receiveManuallyEdited?: Nullable<boolean>;
    wideManuallyEdited?: Nullable<boolean>;
}

export interface DummyDataCopy {
    curve?: Nullable<boolean>;
    directional?: Nullable<boolean>;
    deltaLadder?: Nullable<boolean>;
}

export interface MultiCurveIdMembers {
    curve_id: number;
    curve_members: CurveMembersInput;
}

export interface Response {
    code: number;
    message: string;
}

export interface ResponseOld {
    code: number;
    message: string;
    metaData?: Nullable<JSON>;
}

export interface DeleteMutationResponse extends ResponseOld {
    code: number;
    message: string;
    metaData?: Nullable<JSON>;
}

export interface AddMutationResponse extends ResponseOld {
    code: number;
    message: string;
    metaData?: Nullable<JSON>;
}

export interface IQuery {
    test(): Nullable<number> | Promise<Nullable<number>>;
    getVersion(): string | Promise<string>;
    getBook(session_id: number, book_id: number, trader_id: number): Book | Promise<Book>;
    getMaturityMapper(session_id: number, book_id: number, trader_id: number): Any | Promise<Any>;
    getImpliedSMLimits(session_id: number, book_id: number, trader_id: number): Nullable<SingleMaturityLimitImplied>[] | Promise<Nullable<SingleMaturityLimitImplied>[]>;
    getImpliedRDRLimits(session_id: number, book_id: number, trader_id: number): RelativeDateLimitMembersOutput | Promise<RelativeDateLimitMembersOutput>;
    getSessionCurveById(session_id: number, book_id: number, trader_id: number, curve_id: number): Nullable<SessionCurve> | Promise<Nullable<SessionCurve>>;
    getSessionCurves(session_id: number, book_id: number, trader_id: number): Nullable<SessionCurve>[] | Promise<Nullable<SessionCurve>[]>;
    getExcelCurveTemplate(session_id: number, book_id: number, trader_id: number): Nullable<Any> | Promise<Nullable<Any>>;
    getExcelCurveData(session_id: number, book_id: number, trader_id: number): Nullable<Any> | Promise<Nullable<Any>>;
    getExcelDeltaLadderTemplate(session_id: number, book_id: number, trader_id: number): Nullable<Any> | Promise<Nullable<Any>>;
    getExcelDeltaLadderData(session_id: number, book_id: number, trader_id: number, order_id: number): Nullable<Any> | Promise<Nullable<Any>>;
    getExcelSingleMaturityTemplate(session_id: number, book_id: number, trader_id: number): Nullable<Any> | Promise<Nullable<Any>>;
    getExcelSingleMaturityData(session_id: number, book_id: number, trader_id: number): Nullable<Any> | Promise<Nullable<Any>>;
    getExcelDateRangeTemplate(session_id: number, book_id: number, trader_id: number): Nullable<Any> | Promise<Nullable<Any>>;
    getExcelDateRangeData(session_id: number, book_id: number, trader_id: number): Nullable<Any> | Promise<Nullable<Any>>;
    getExcelMarketMakingTemplate(session_id: number, book_id: number, trader_id: number): Nullable<Any> | Promise<Nullable<Any>>;
    getExcelMarketMakingData(session_id: number, book_id: number, trader_id: number): Nullable<Any> | Promise<Nullable<Any>>;
    getAllFeSettings(session_id: number, book_id: number): Nullable<Any> | Promise<Nullable<Any>>;
    getSessionFeSettingsByTypeId(session_id: number, setting_type_id: number): Nullable<Any> | Promise<Nullable<Any>>;
    getSessionBookFeSettingsByTypeId(session_id: number, book_id: number, setting_type_id: number): Nullable<Any> | Promise<Nullable<Any>>;
    getSessionUserFeSettingsByTypeId(session_id: number, setting_type_id: number): Nullable<Any> | Promise<Nullable<Any>>;
    getSessionBookUserFeSettingsByTypeId(session_id: number, book_id: number, setting_type_id: number): Nullable<Any> | Promise<Nullable<Any>>;
    getSessionOrdersByOrderTypes(session_id: number, book_id: number, trader_id: number, order_type_ids: number[]): Nullable<SessionOrder>[] | Promise<Nullable<SessionOrder>[]>;
    getSessionOrderById(session_id: number, book_id: number, trader_id: number, order_id: number): Nullable<SessionOrder> | Promise<Nullable<SessionOrder>>;
    getSessionOrderDetailsByOrderId(session_id: number, book_id: number, trader_id: number, order_id: number): Nullable<SessionOrderDetail>[] | Promise<Nullable<SessionOrderDetail>[]>;
    getSessionOrderDetailsByInstrumentId(session_id: number, book_id: number, trader_id: number, order_id: number, instrument_id: number): Nullable<SessionOrderDetail> | Promise<Nullable<SessionOrderDetail>>;
    getSessionParametersByParameterTypes(book_id: number, trader_id: number, session_id: number, parameter_type_ids: Nullable<number>[]): Nullable<SessionLimit>[] | Promise<Nullable<SessionLimit>[]>;
    getSessionParameterById(book_id: number, trader_id: number, session_id: number, parameter_id: number): Nullable<SessionLimit> | Promise<Nullable<SessionLimit>>;
    getSessionInstruments(session_id: number, book_id: number, trader_id: number): Nullable<SessionInstrument>[] | Promise<Nullable<SessionInstrument>[]>;
    getSession(session_id: number, book_id: number, trader_id: number): Nullable<Session> | Promise<Nullable<Session>>;
    userMePermissions(): UserMePermissions | Promise<UserMePermissions>;
    getUser(session_id: number, book_id: number, trader_id: number): User | Promise<User>;
}

export interface InstrumentMembers {
    startDate?: Nullable<string>;
    maturityDate: string;
    numberOfPeriods?: Nullable<number>;
    floatingRateIndex?: Nullable<string>;
}

export interface SessionInstrument {
    session_id: number;
    instrument_id: number;
    symbol: string;
    instrument_members: InstrumentMembers;
    instrument_subtype_id: number;
    instrument_subtype_name: string;
}

export interface SessionCurve {
    curve_id: number;
    instrument_id: number;
    symbol: string;
    instrument_members: InstrumentMembers;
    book_id: number;
    trader_id: number;
    session_id: number;
    curve_members: JSON;
    custom_members?: Nullable<JSON>;
    updated_at: DateTime;
    updated_by_email: string;
}

export interface SessionOrder {
    order_id: number;
    order_subtype_id: number;
    order_subtype_name: string;
    order_type_id: number;
    order_type_name: string;
    session_id: number;
    book_id: number;
    trader_id: number;
    order_key?: Nullable<string>;
    order_members: JSON;
    custom_members?: Nullable<JSON>;
    updated_at: DateTime;
    updated_by_email: string;
    updated_by: number;
}

export interface SessionOrderDetail {
    order_id: number;
    session_id: number;
    book_id: number;
    trader_id: number;
    instrument_id: number;
    order_detail_members: JSON;
    custom_members?: Nullable<JSON>;
    updated_at: DateTime;
    updated_by_email: string;
    updated_by: number;
}

export interface SessionLimit {
    parameter_id: number;
    parameter_subtype_name: string;
    parameter_subtype_id: number;
    parameter_type_id: number;
    session_id: number;
    book_id: number;
    trader_id: number;
    parameter_key?: Nullable<string>;
    parameter_members: JSON;
    custom_members?: Nullable<JSON>;
    updated_at: DateTime;
    updated_by_email: string;
    updated_by: number;
}

export interface Session {
    session_id: number;
    product_id: number;
    session_name: string;
    session_date: DateYYYYMMDD;
    session_time: string;
    session_state: string;
    meta_data?: Nullable<string>;
}

export interface UserPermission {
    user_id: number;
    entity_id: number;
    book_id: number;
    book_name: string;
    trader_id: number;
    trader_email: string;
    subject: string;
    action: string;
}

export interface UserActiveSessionBook {
    user_id: number;
    book_id: number;
    session_id: number;
    session_state: string;
    session_name: string;
}

export interface UserMe {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    organization_id: number;
    permissions: Nullable<UserPermission>[];
    active_session_books: Nullable<UserActiveSessionBook>[];
    is_demo_user: boolean;
}

export interface Book {
    book_id: number;
    book_name: string;
    organization_id: number;
    updated_by: number;
}

export interface SingleMaturityLimitImplied {
    instrument_id: number;
    do_max_pay_limit: number;
    do_max_receive_limit: number;
    mm_max_pay_limit: number;
    mm_max_receive_limit: number;
    dl_max_pay_limit: number;
    dl_max_receive_limit: number;
    user_max_pay_limit?: Nullable<number>;
    user_max_receive_limit?: Nullable<number>;
    user_parameter_id?: Nullable<number>;
    inferred: boolean;
    limit_breach: boolean;
    breach_direction: BreachDirection;
    max_pay_limit: number;
    max_receive_limit: number;
    cumulative_pay_exposure: number;
    cumulative_receive_exposure: number;
}

export interface BucketOutput {
    name: string;
    instrument_ids: number[];
}

export interface BucketPairLimitOutput {
    near_bucket_name: string;
    far_bucket_name: string;
    limit: number;
    direction: Direction;
    inferred: boolean;
}

export interface RelativeDateLimitMembersOutput {
    buckets: BucketOutput[];
    bucket_pair_limits: BucketPairLimitOutput[];
    unit: AmountType;
}

export interface IMutation {
    addMMWOrdersParams(session_id: number, book_id: number, trader_id: number, mmw_json: MMWJson): AddMutationResponse | Promise<AddMutationResponse>;
    addImpliedLimits(session_id: number, book_id: number, trader_id: number): AddMutationResponse | Promise<AddMutationResponse>;
    addSessionCurve(session_id: number, book_id: number, trader_id: number, instrument_id: number, curve_members: CurveMembersInput, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    updateSessionCurve(session_id: number, book_id: number, trader_id: number, curve_id: number, curve_members: CurveMembersInput, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    updateMultiSessionCurves(session_id: number, book_id: number, trader_id: number, session_curves: MultiCurveIdMembers[]): AddMutationResponse | Promise<AddMutationResponse>;
    deleteSessionCurvesCustomColumn(session_id: number, book_id: number, trader_id: number, column_name: string): DeleteMutationResponse | Promise<DeleteMutationResponse>;
    deleteSessionCurvesRateAdj(session_id: number, book_id: number, trader_id: number, curve_ids: number[]): DeleteMutationResponse | Promise<DeleteMutationResponse>;
    deleteSessionCurves(session_id: number, book_id: number, trader_id: number, curve_ids: number[]): DeleteMutationResponse | Promise<DeleteMutationResponse>;
    deleteAllSessionCurves(session_id: number, book_id: number, trader_id: number): DeleteMutationResponse | Promise<DeleteMutationResponse>;
    demoBookTraderInitiation(session_id: number, email: string, book_name: string, trader_id?: Nullable<number>, book_id?: Nullable<number>): SuccessDemoBookTraderInit | Promise<SuccessDemoBookTraderInit>;
    replaceExcelCurveData(session_id: number, book_id: number, trader_id: number, excel_data: string): AddMutationResponse | Promise<AddMutationResponse>;
    upsertExcelCurveData(session_id: number, book_id: number, trader_id: number, excel_data: string): AddMutationResponse | Promise<AddMutationResponse>;
    replaceExcelDeltaLadderData(session_id: number, book_id: number, trader_id: number, order_id: number, excel_data: string): AddMutationResponse | Promise<AddMutationResponse>;
    replaceExcelSingleMaturityData(session_id: number, book_id: number, trader_id: number, excel_data: string): AddMutationResponse | Promise<AddMutationResponse>;
    replaceExcelDateRangeData(session_id: number, book_id: number, trader_id: number, excel_data: string): AddMutationResponse | Promise<AddMutationResponse>;
    replaceExcelMarketMakingData(session_id: number, book_id: number, trader_id: number, excel_data: string): AddMutationResponse | Promise<AddMutationResponse>;
    addSessionBookFeSettingsByTypeId(session_id: number, book_id: number, setting_type_id: JSON, setting_members: JSON): Any | Promise<Any>;
    addSessionUserFeSettingsByTypeId(session_id: number, setting_type_id: JSON, setting_members: JSON): AddMutationResponse | Promise<AddMutationResponse>;
    addSessionBookUserFeSettingsByTypeId(session_id: number, book_id: number, setting_type_id: JSON, setting_members: JSON): AddMutationResponse | Promise<AddMutationResponse>;
    updateSessionBookFeSettingsByTypeId(session_id: number, book_id: number, setting_members: JSON, setting_type_id: number): AddMutationResponse | Promise<AddMutationResponse>;
    updateSessionUserFeSettingsByTypeId(session_id: number, setting_members: JSON, setting_type_id: number): AddMutationResponse | Promise<AddMutationResponse>;
    updateSessionBookUserFeSettingsByTypeId(session_id: number, book_id: number, setting_members: JSON, setting_type_id: number): AddMutationResponse | Promise<AddMutationResponse>;
    addMMWJson(session_id: number, book_id: number, trader_id: number, json_data: JSON): AddMutationResponse | Promise<AddMutationResponse>;
    addSingleMaturityDOOrder(session_id: number, book_id: number, trader_id: number, order_members: SingleMaturityDOMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    addFlyDOOrder(session_id: number, book_id: number, trader_id: number, order_members: FlyDOMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    addSpreadDOOrder(session_id: number, book_id: number, trader_id: number, order_members: SpreadDOMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    addAnyOfDOOrder(session_id: number, book_id: number, trader_id: number, order_members: AnyOfDOMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    addAllOfDOOrder(session_id: number, book_id: number, trader_id: number, order_members: AllOfDOMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    addTagAlongDOOrder(session_id: number, book_id: number, trader_id: number, order_members: TagAlongDOMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    addSingleMaturityMMOrder(session_id: number, book_id: number, trader_id: number, order_members: SingleMaturityMMOrderMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    addSpreadMMOrder(session_id: number, book_id: number, trader_id: number, order_members: SpreadMMOrderMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    addFlyMMOrder(session_id: number, book_id: number, trader_id: number, order_members: FlyMMOrderMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    updateSingleMaturityDOOrder(session_id: number, book_id: number, trader_id: number, order_id: number, order_members: SingleMaturityDOMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    updateSpreadDOOrder(session_id: number, book_id: number, trader_id: number, order_id: number, order_members: SpreadDOMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    updateFlyDOOrder(session_id: number, book_id: number, trader_id: number, order_id: number, order_members: FlyDOMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    updateAnyOfDOOrder(session_id: number, book_id: number, trader_id: number, order_id: number, order_members: AnyOfDOMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    updateAllOfDOOrder(session_id: number, book_id: number, trader_id: number, order_id: number, order_members: AllOfDOMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    updateTagAlongDOOrder(session_id: number, book_id: number, trader_id: number, order_id: number, order_members: TagAlongDOMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    updateSingleMaturityMMOrder(session_id: number, book_id: number, trader_id: number, order_id: number, order_members: SingleMaturityMMOrderMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    updateSpreadMMOrder(session_id: number, book_id: number, trader_id: number, order_id: number, order_members: SpreadMMOrderMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    updateFlyMMOrder(session_id: number, book_id: number, trader_id: number, order_id: number, order_members: FlyMMOrderMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    addRuleBasedMMOrder(session_id: number, book_id: number, trader_id: number, order_subtype_id: number, order_members: RuleBasedMMOrderMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    updateRuleBasedMMOrder(session_id: number, book_id: number, trader_id: number, order_subtype_id: number, order_id: number, order_members: RuleBasedMMOrderMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    addDeltaLadderOrder(session_id: number, book_id: number, trader_id: number, order_members: DeltaLadderOrderMembers): AddMutationResponse | Promise<AddMutationResponse>;
    updateDeltaLadderOrder(session_id: number, book_id: number, trader_id: number, order_id: number, order_members: DeltaLadderOrderMembers): AddMutationResponse | Promise<AddMutationResponse>;
    addDeltaLadderOrderDetail(session_id: number, book_id: number, trader_id: number, order_id: number, instrument_id: number, order_detail_members: DeltaLadderOrderDetailMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    updateDeltaLadderOrderDetail(session_id: number, book_id: number, trader_id: number, order_id: number, instrument_id: number, order_detail_members: DeltaLadderOrderDetailMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    deleteSessionOrdersCustomColumn(session_id: number, book_id: number, trader_id: number, order_type_id: number, column_name: string): DeleteMutationResponse | Promise<DeleteMutationResponse>;
    deleteSessionOrders(session_id: number, book_id: number, trader_id: number, order_ids: number[]): DeleteMutationResponse | Promise<DeleteMutationResponse>;
    deleteOrderDetailsCustomColumn(session_id: number, book_id: number, trader_id: number, order_id: number, column_name: string): DeleteMutationResponse | Promise<DeleteMutationResponse>;
    deleteOrderDetails(session_id: number, book_id: number, trader_id: number, order_id: number, instrument_ids: number[]): DeleteMutationResponse | Promise<DeleteMutationResponse>;
    deleteAllSessionOrdersByTypeIds(session_id: number, book_id: number, trader_id: number, order_type_ids: number[]): DeleteMutationResponse | Promise<DeleteMutationResponse>;
    addSingleMaturityLimit(session_id: number, book_id: number, trader_id: number, parameter_members: SingleMaturityLimitMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    addSingleMaturityLimits(session_id: number, book_id: number, trader_id: number, parameter_members_array: Nullable<SingleMaturityLimitMembers>[]): AddMutationResponse | Promise<AddMutationResponse>;
    updateSingleMaturityLimit(session_id: number, book_id: number, trader_id: number, parameter_id: number, parameter_members: SingleMaturityLimitMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    addSingleMaturityLimitSetting(session_id: number, book_id: number, trader_id: number, parameter_members: SingleMaturityLimitSettingMembers): AddMutationResponse | Promise<AddMutationResponse>;
    updateSingleMaturityLimitSetting(session_id: number, book_id: number, trader_id: number, parameter_id: number, parameter_members: SingleMaturityLimitSettingMembers): AddMutationResponse | Promise<AddMutationResponse>;
    addDateRangeLimit(session_id: number, book_id: number, trader_id: number, parameter_members: DateRangeLimitMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    updateDateRangeLimit(session_id: number, book_id: number, trader_id: number, parameter_id: number, parameter_members: DateRangeLimitMembers, custom_members?: Nullable<JSON>): AddMutationResponse | Promise<AddMutationResponse>;
    addRelativeDateLimit(session_id: number, book_id: number, trader_id: number, parameter_members: JSON): AddMutationResponse | Promise<AddMutationResponse>;
    updateRelativeDateLimit(session_id: number, book_id: number, trader_id: number, parameter_id: number, parameter_members: JSON): AddMutationResponse | Promise<AddMutationResponse>;
    addRelativeDateLimitSetting(session_id: number, book_id: number, trader_id: number, parameter_members: RelativeDateLimitSettingMembers): AddMutationResponse | Promise<AddMutationResponse>;
    addDlNetDV01RangeLimit(session_id: number, book_id: number, trader_id: number, parameter_members: DlNetDV01RangeMembers): AddMutationResponse | Promise<AddMutationResponse>;
    updateDlNetDV01RangeLimit(session_id: number, book_id: number, trader_id: number, parameter_id: number, parameter_members: DlNetDV01RangeMembers): AddMutationResponse | Promise<AddMutationResponse>;
    updateRelativeDateLimitSetting(session_id: number, book_id: number, trader_id: number, parameter_id: number, parameter_members: RelativeDateLimitSettingMembers): AddMutationResponse | Promise<AddMutationResponse>;
    addOtherParameters(session_id: number, book_id: number, trader_id: number, parameter_detail_list: Nullable<OtherParametersMembersWithSubId>[]): AddMutationResponse | Promise<AddMutationResponse>;
    updateOtherParameters(session_id: number, book_id: number, trader_id: number, parameter_detail_list: Nullable<OtherParametersMembersWithId>[]): AddMutationResponse | Promise<AddMutationResponse>;
    addLiquidInstruments(session_id: number, book_id: number, trader_id: number, parameter_members: LiquidInstrumentsMembers): AddMutationResponse | Promise<AddMutationResponse>;
    updateLiquidInstruments(session_id: number, book_id: number, trader_id: number, parameter_id: number, parameter_members: LiquidInstrumentsMembers): AddMutationResponse | Promise<AddMutationResponse>;
    deleteSessionParametersCustomColumn(session_id: number, book_id: number, trader_id: number, parameter_type_id: number, column_name: string): DeleteMutationResponse | Promise<DeleteMutationResponse>;
    deleteSessionParameters(session_id: number, book_id: number, trader_id: number, parameter_ids: number[]): DeleteMutationResponse | Promise<DeleteMutationResponse>;
    deleteAllSessionParametersByTypeIds(session_id: number, book_id: number, trader_id: number, parameter_type_ids: number[]): DeleteMutationResponse | Promise<DeleteMutationResponse>;
}

export interface SuccessDemoBookTraderInit {
    trader_id: number;
    book_id: number;
}

export interface SessionPermission {
    session_id: number;
    session_name: string;
    status: string;
    book_id: number[];
}

export interface SubjectActions {
    subject: string;
    actions?: Nullable<string[]>;
}

export interface BookTraderPermissions {
    session_id: number;
    book_id: number;
    book_name: string;
    trader_id: number;
    trader_email: string;
    permissions: Nullable<SubjectActions>[];
}

export interface UserMePermissions {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    sessions: Nullable<SessionPermission>[];
    book_trader: Nullable<BookTraderPermissions>[];
    is_demo_user: boolean;
}

export interface User {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
}

export type JSON = any;
export type DV01 = any;
export type Any = any;
export type DateTime = any;
export type DateYYYYMMDD = any;
type Nullable<T> = T | null;
