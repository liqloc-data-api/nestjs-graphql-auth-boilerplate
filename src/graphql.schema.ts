
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

export type JSON = any;
export type DV01 = any;
export type Any = any;
export type DateTime = any;
export type DateYYYYMMDD = any;
type Nullable<T> = T | null;
