// TODO: Need to figure out all the unknown values
export type Raw = { type: 'raw'; value: unknown };
export type Guid = { type: 'guid'; value: unknown };
export type Duration = { type: 'duration'; value: unknown };
export type Binary = { type: 'binary'; value: unknown };
export type Json = { type: 'json'; value: unknown };
export type Alias = { type: 'alias'; name: string; value: unknown };
export type Decimal = { type: 'decimal'; value: unknown };
export type CustomType =
  | Raw
  | Guid
  | Duration
  | Binary
  | Json
  | Alias
  | Decimal;
export type DataType = string | Date | number | boolean | CustomType;
export type ComparisonOperators<DefaultType = string | number> = {
  eq: DefaultType;
  ne: DefaultType;
  gt: number;
  ge: number;
  lt: number;
  le: number;
  has: DataType;
  in: DefaultType[];
};
export type BooleanFunctions = 'startswith' | 'endswith' | 'contains';
export type LogicalOperators = 'and' | 'or' | 'not';
type NestedFilter<PropertyType> = {
  [ComparisonOperator in keyof ComparisonOperators]?: ComparisonOperators<PropertyType>[ComparisonOperator];
} & { [BooleanFunction in BooleanFunctions]?: string };

type FilterValue<PropertyType> =
  | PropertyType
  | NestedFilter<PropertyType>
  | (PropertyType | NestedFilter<PropertyType>)[];

type _Filter<T> = { [P in keyof T]?: FilterValue<T[P]> };
export type Filter<T> =
  | _Filter<T>
  | _Filter<T>[]
  | { not: _Filter<T> }
  | { [LogicalOperator in LogicalOperators]?: Filter<T>[] };

// TRANSFORMS
type AggregateMethods = 'sum' | 'min' | 'max' | 'average' | 'countdistinct';
export type Aggregate<T> = {
  [K in keyof T]?: {
    with?: AggregateMethods;
    as: string;
  };
};

export type GroupBy<T> = {
  properties: (keyof T)[];
  transform?: _Transform<T> | _Transform<T>[];
};
export type _Transform<T> = {
  filter?: Filter<T>;
  groupBy?: GroupBy<T>;
  aggregate?: Aggregate<T>;
};

// TODO: Cant be fully typesafe because there can be a transformation after an aggregate therefore it should be able to accept newly created fields.
export type Transform<T> =
  | _Transform<T | Record<string, unknown>>
  | _Transform<T | Record<string, unknown>>[];
export type Select<T> = (keyof T)[]; // TODO: doesn't accept expanded cases
export type OrderBy<T> =
  | keyof T
  | (keyof T)[]
  | [keyof T, 'asc' | 'desc'][]
  | { [K in keyof T]: (keyof T)[] | [keyof T, 'asc' | 'desc'][] };

// EXPAND
// TODO: There is a big problem... rn there is no concept of such linked lists, so nested expands
// are wrongly typed because let's say there is a link such as link1 -> link2 -> link3
// if you want to get data from the 3 lists you need a nested expand but the second expand should
// be a column of link2, not of link1... right now the type of the expand only checks for the first list.
export type ExpandOptions<T> = {
  select?: Select<T>; // TODO: need expand relations
  filter?: Filter<T>;
  orderBy?: OrderBy<T>;
  skip?: number;
  top?: number;
  levels?: number | 'max';
  count?: boolean | Filter<T>;
  expand?: Expand<T>; // TODO: need expand relations
};
export type Expand<T> =
  | keyof T
  | (keyof T)[]
  | { [K in keyof T]: ExpandOptions<T> }
  | { [K in keyof T]: ExpandOptions<T> }[];
export type Func<T> = {
  [x: string]: { [K in keyof T]?: null | T[K] | T[K][] | CustomType };
};
export type Key<T> = number | { [K in keyof T]?: T[K] };
export type QueryOptions<T> = ExpandOptions<T> & {
  search?: string;
  skiptoken?: string;
  transform?: Transform<T>;
  key?: Key<T>;
  action?: string;
  func?: Func<T>;
  format?: string;
};

// TODO: Dont really know wha the type of these should be
export const raw = (value: string): Raw => ({ type: 'raw', value });
export const guid = (value: string): Guid => ({ type: 'guid', value });
export const duration = (value: string): Duration => ({
  type: 'duration',
  value,
});
export const binary = (value: string): Binary => ({ type: 'binary', value });
export const json = (
  value: Record<string, unknown> | Record<string, unknown>[],
): Json => ({ type: 'json', value });
export const alias = (
  name: string,
  value: Record<string, unknown> | string[],
): Alias => ({
  type: 'alias',
  name,
  value,
});
export const decimal = (value: string): Decimal => ({ type: 'decimal', value });
