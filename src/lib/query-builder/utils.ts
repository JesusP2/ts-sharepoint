import type { ComparisonOperators } from './types';
export const comparisonOperators: (keyof ComparisonOperators)[] = [
  'eq',
  'ne',
  'gt',
  'ge',
  'lt',
  'le',
  'has',
  'in',
];

export const LOGICAL_OPERATORS = ['and', 'or', 'not'] as const;
export const COLLECTION_OPERATORS = ['any', 'all'] as const;
export const BOOLEAN_FUNCTIONS = [
  'startswith',
  'endswith',
  'contains',
] as const;
export const SUPPORTED_EXPAND_PROPERTIES = [
  'expand',
  'levels',
  'select',
  'skip',
  'top',
  'count',
  'orderby',
  'filter',
] as const;
