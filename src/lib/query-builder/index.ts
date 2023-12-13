import querystring from 'querystring';
import { objectEntries, objectKeys } from '../utils';
const FUNCTION_REGEX = /\((.*)\)/;
const INDEXOF_REGEX = /(?!indexof)\((\w+)\)/;
export const ITEM_ROOT = '';
import type {
  Aggregate,
  Alias,
  DataType,
  Expand,
  ExpandOptions,
  Filter,
  GroupBy,
  OrderBy,
  QueryOptions,
  Transform,
  _Transform,
} from './types';
import { LOGICAL_OPERATORS, SUPPORTED_EXPAND_PROPERTIES } from './utils';

export function queryBuilder<T>(props: QueryOptions<T>) {
  const path = '';
  const aliases: Alias[] = [];
}

function handleValue(value: DataType, aliases?: Alias[]): unknown {
  if (typeof value === 'string') {
    return `'${escapeIllegalChars(value)}'`;
  } else if (value instanceof Date) {
    return value.toISOString();
  } else if (typeof value === 'number') {
    return value;
  } else if (Array.isArray(value)) {
    return `[${value.map((d) => handleValue(d)).join(',')}]`;
  } else if (value === null) {
    return value;
  } else if (typeof value === 'object') {
    switch (value.type) {
      case 'raw':
      case 'guid':
        return value.value;
      case 'duration':
        return `duration'${value.value}'`;
      case 'binary':
        return `binary'${value.value}'`;
      case 'alias':
        // Store
        if (Array.isArray(aliases)) aliases.push(value as Alias);
        return `@${(value as Alias).name}`;
      case 'json':
        return querystring.escape(JSON.stringify(value.value));
      case 'decimal':
        return `${value.value}M`;
      default:
        return objectEntries(value)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `${String(k)}=${handleValue(v, aliases)}`)
          .join(',');
    }
  }
  return value;
}

function escapeIllegalChars(string: string) {
  string = string.replace(/%/g, '%25');
  string = string.replace(/\+/g, '%2B');
  string = string.replace(/\//g, '%2F');
  string = string.replace(/\?/g, '%3F');
  string = string.replace(/#/g, '%23');
  string = string.replace(/&/g, '%26');
  string = string.replace(/'/g, "''");
  return string;
}

function buildExpand<T>(expands: Expand<T>): string {
  if (typeof expands === 'number') {
    return expands.toString();
  } else if (typeof expands === 'string') {
    if (expands.indexOf('/') === -1) {
      return expands;
    }

    // Change `Foo/Bar/Baz` to `Foo($expand=Bar($expand=Baz))`
    return expands
      .split('/')
      .reverse()
      .reduce((results, item, index, arr) => {
        if (index === 0) {
          // Inner-most item
          return `$expand=${item}`;
        } else if (index === arr.length - 1) {
          // Outer-most item, don't add `$expand=` prefix (added above)
          return `${item}(${results})`;
        } else {
          // Other items
          return `$expand=${item}(${results})`;
        }
      }, '');
  } else if (Array.isArray(expands)) {
    return `${expands.map((e) => buildExpand(e)).join(',')}`;
  } else if (typeof expands === 'object') {
    const expandKeys = objectKeys(expands);

    if (
      expandKeys.some(
        (key) =>
          SUPPORTED_EXPAND_PROPERTIES.indexOf(
            String(
              key,
            ).toLowerCase() as (typeof SUPPORTED_EXPAND_PROPERTIES)[number],
          ) !== -1,
      )
    ) {
      return expandKeys
        .map((key) => {
          let value;
          switch (key) {
            case 'filter':
              value = buildFilter(expands[key]);
              break;
            case 'orderBy':
              value = buildOrderBy(expands[key] as OrderBy<T>);
              break;
            case 'levels':
            case 'count':
            case 'skip':
            case 'top':
              value = `${expands[key]}`;
              break;
            default:
              value = buildExpand(expands[key] as Expand<T>);
          }
          return `$${String(key).toLowerCase()}=${value}`;
        })
        .join(';');
    } else {
      return expandKeys
        .map((key) => {
          const builtExpand = buildExpand(expands[key] as Expand<T>);
          return builtExpand ? `${String(key)}(${builtExpand})` : key;
        })
        .join(',');
    }
  }
  return '';
}

function buildTransforms<T>(transforms: _Transform<T> | _Transform<T>[]) {
  // Wrap single object an array for simplified processing
  const transformsArray = Array.isArray(transforms) ? transforms : [transforms];

  const transformsResult = transformsArray.reduce(
    (result: string[], transform) => {
      const { aggregate, filter, groupBy, ...rest } = transform;

      // TODO: support as many of the following:
      //   topcount, topsum, toppercent,
      //   bottomsum, bottomcount, bottompercent,
      //   identity, concat, expand, search, compute, isdefined
      const unsupportedKeys = Object.keys(rest);
      if (unsupportedKeys.length) {
        throw new Error(`Unsupported transform(s): ${unsupportedKeys}`);
      }

      if (aggregate) {
        result.push(`aggregate(${buildAggregate(aggregate)})`);
      }
      if (filter) {
        const builtFilter = buildFilter(filter);
        if (builtFilter) {
          result.push(`filter(${buildFilter(builtFilter)})`);
        }
      }
      if (groupBy) {
        result.push(`groupby(${buildGroupBy(groupBy)})`);
      }

      return result;
    },
    [],
  );

  return transformsResult.join('/') || undefined;
}

function buildAggregate<T>(aggregate: Aggregate<T> | Aggregate<T>[]) {
  // Wrap single object in an array for simplified processing
  const aggregateArray = Array.isArray(aggregate) ? aggregate : [aggregate];

  return aggregateArray
    .map((aggregateItem) => {
      return typeof aggregateItem === 'string' ? aggregateItem : (
          objectKeys(aggregateItem).map((_aggregateKey) => {
            const aggregateValue = aggregateItem[_aggregateKey];
            const aggregateKey = String(_aggregateKey);
            if (!aggregateValue) return; // NOTE: cant be false

            if (!aggregateValue.with && aggregateValue.as) {
              return `${aggregateKey} as ${aggregateValue.as}`;
            }

            if (!aggregateValue.with) {
              throw new Error(`'with' property required for '${aggregateKey}'`);
            }

            if (!aggregateValue.as) {
              throw new Error(`'as' property required for '${aggregateKey}'`);
            }

            return `${aggregateKey} with ${aggregateValue.with} as ${aggregateValue.as}`;
          })
        );
    })
    .join(',');
}

function buildGroupBy<T>(groupBy: GroupBy<T>) {
  if (!groupBy.properties) {
    throw new Error("'properties' property required for groupBy");
  }

  let result = `(${groupBy.properties.join(',')})`;

  if (groupBy.transform) {
    result += `,${buildTransforms(groupBy.transform)}`;
  }

  return result;
}

function buildOrderBy<T>(orderBy: OrderBy<T>, prefix: string = ''): string {
  if (Array.isArray(orderBy)) {
    return orderBy
      .map((value) =>
        (
          Array.isArray(value) &&
          value.length === 2 &&
          ['asc', 'desc'].indexOf(value[1]) !== -1
        ) ?
          value.join(' ')
        : value,
      )
      .map((v) => `${prefix}${String(v)}`)
      .join(',');
  } else if (typeof orderBy === 'object') {
    return objectEntries(orderBy)
      .map(([key, value]) => buildOrderBy(value, `${String(key)}/`))
      .map((v) => `${prefix}${v}`)
      .join(',');
  }
  return `${prefix}${String(orderBy)}`;
}

function buildUrl(path: string, params: Record<string, unknown>): string {
  // This can be refactored using URL API. But IE does not support it.
  const queries: string[] = Object.getOwnPropertyNames(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .map((key) => `${key}=${params[key]}`);
  return queries.length ? `${path}?${queries.join('&')}` : path;
}

function parseNot(builtFilters: string[]): string {
  return `not(${builtFilters.join(' and ')})`;
}

function buildFilter<T>(
  filters: Filter<T> = {},
  aliases: Alias[] = [],
  propPrefix = '',
): string {
  return (
    (Array.isArray(filters) ? filters : [filters]).reduce(
      (acc: string[], filter) => {
        if (filter) {
          const builtFilter = buildFilterCore(filter, aliases, propPrefix);
          if (builtFilter) {
            acc.push(builtFilter);
          }
        }
        return acc;
      },
      [],
    ) as string[]
  ).join(' and ');

  function buildFilterCore<T>(
    filter: Filter<T> = {},
    aliases: Alias[] = [],
    propPrefix = '',
  ) {
    let filterExpr = '';
    if (typeof filter === 'string') {
      // Use raw filter string
      filterExpr = filter;
    } else if (filter && typeof filter === 'object') {
      const filtersArray = objectKeys(filter).reduce(
        (result: unknown[], filterKey) => {
          const value = filter[filterKey];
          if (value === undefined) {
            return result;
          }

          let propName = '';
          if (propPrefix) {
            if (filterKey === ITEM_ROOT) {
              propName = propPrefix;
            } else if (INDEXOF_REGEX.test(filterKey)) {
              propName = filterKey.replace(INDEXOF_REGEX, (_, $1) =>
                $1.trim() === ITEM_ROOT ?
                  `(${propPrefix})`
                : `(${propPrefix}/${$1.trim()})`,
              );
            } else if (FUNCTION_REGEX.test(filterKey)) {
              propName = filterKey.replace(FUNCTION_REGEX, (_, $1) =>
                $1.trim() === ITEM_ROOT ?
                  `(${propPrefix})`
                : `(${propPrefix}/${$1.trim()})`,
              );
            } else {
              propName = `${propPrefix}/${filterKey}`;
            }
          } else {
            propName = filterKey;
          }

          if (filterKey === ITEM_ROOT && Array.isArray(value)) {
            return result.concat(
              value.map((arrayValue: any) =>
                renderPrimitiveValue(propName, arrayValue),
              ),
            );
          }

          if (
            ['number', 'string', 'boolean'].indexOf(typeof value) !== -1 ||
            value instanceof Date ||
            value === null
          ) {
            // Simple key/value handled as equals operator
            result.push(renderPrimitiveValue(propName, value, aliases));
          } else if (Array.isArray(value)) {
            const op = filterKey;
            const builtFilters = value
              .map((v) => buildFilter(v, aliases, propPrefix))
              .filter((f) => f)
              .map((f) =>
                LOGICAL_OPERATORS.indexOf(op) !== -1 ? `(${f})` : f,
              );
            if (builtFilters.length) {
              if (LOGICAL_OPERATORS.indexOf(op) !== -1) {
                if (builtFilters.length) {
                  if (op === 'not') {
                    result.push(parseNot(builtFilters as string[]));
                  } else {
                    result.push(`(${builtFilters.join(` ${op} `)})`);
                  }
                }
              } else {
                result.push(builtFilters.join(` ${op} `));
              }
            }
          } else if (LOGICAL_OPERATORS.indexOf(propName) !== -1) {
            const op = propName;
            const builtFilters = Object.keys(value).map((valueKey) =>
              buildFilterCore({ [valueKey]: value[valueKey] }),
            );
            if (builtFilters.length) {
              if (op === 'not') {
                result.push(parseNot(builtFilters as string[]));
              } else {
                result.push(`(${builtFilters.join(` ${op} `)})`);
              }
            }
          } else if (typeof value === 'object') {
            if ('type' in value) {
              result.push(renderPrimitiveValue(propName, value, aliases));
            } else {
              const operators = Object.keys(value);
              operators.forEach((op) => {
                if (value[op] === undefined) {
                  return;
                }

                if (
                  COMPARISON_OPERATORS.indexOf(op) !== -1 &&
                  op !== 'has' &&
                  op !== 'in'
                ) {
                  result.push(
                    `${propName} ${op} ${handleValue(value[op], aliases)}`,
                  );
                } else if (LOGICAL_OPERATORS.indexOf(op) !== -1) {
                  if (Array.isArray(value[op])) {
                    result.push(
                      value[op]
                        .map(
                          (v: any) =>
                            '(' + buildFilterCore(v, aliases, propName) + ')',
                        )
                        .join(` ${op} `),
                    );
                  } else {
                    result.push(
                      '(' + buildFilterCore(value[op], aliases, propName) + ')',
                    );
                  }
                } else if (COLLECTION_OPERATORS.indexOf(op) !== -1) {
                  const collectionClause = buildCollectionClause(
                    filterKey.toLowerCase(),
                    value[op],
                    op,
                    propName,
                  );
                  if (collectionClause) {
                    result.push(collectionClause);
                  }
                } else if (op === 'has') {
                  result.push(
                    `${propName} ${op} ${handleValue(value[op], aliases)}`,
                  );
                } else if (op === 'in') {
                  const resultingValues =
                    Array.isArray(value[op]) ?
                      value[op]
                    : value[op].value.map((typedValue: any) => ({
                        type: value[op].type,
                        value: typedValue,
                      }));

                  result.push(
                    propName +
                      ' in (' +
                      resultingValues
                        .map((v: any) => handleValue(v, aliases))
                        .join(',') +
                      ')',
                  );
                } else if (BOOLEAN_FUNCTIONS.indexOf(op) !== -1) {
                  // Simple boolean functions (startswith, endswith, contains)
                  result.push(
                    `${op}(${propName},${handleValue(value[op], aliases)})`,
                  );
                } else {
                  // Nested property
                  const filter = buildFilterCore(value, aliases, propName);
                  if (filter) {
                    result.push(filter);
                  }
                }
              });
            }
          } else {
            throw new Error(`Unexpected value type: ${value}`);
          }

          return result;
        },
        [],
      );

      filterExpr = filtersArray.join(' and ');
    } /* else {
        throw new Error(`Unexpected filters type: ${filter}`);
      } */
    return filterExpr;
  }

  function buildCollectionClause(
    lambdaParameter: string,
    value: any,
    op: string,
    propName: string,
  ) {
    let clause = '';

    if (typeof value === 'string' || value instanceof String) {
      clause = getStringCollectionClause(lambdaParameter, value, op, propName);
    } else if (value) {
      // normalize {any:[{prop1: 1}, {prop2: 1}]} --> {any:{prop1: 1, prop2: 1}}; same for 'all',
      // simple values collection: {any:[{'': 'simpleVal1'}, {'': 'simpleVal2'}]} --> {any:{'': ['simpleVal1', 'simpleVal2']}}; same for 'all',
      const filterValue =
        Array.isArray(value) ?
          value.reduce((acc, item) => {
            if (item.hasOwnProperty(ITEM_ROOT)) {
              if (!acc.hasOwnProperty(ITEM_ROOT)) {
                acc[ITEM_ROOT] = [];
              }
              acc[ITEM_ROOT].push(item[ITEM_ROOT]);
              return acc;
            }
            return { ...acc, ...item };
          }, {})
        : value;

      const filter = buildFilterCore(filterValue, aliases, lambdaParameter);
      clause = `${propName}/${op}(${
        filter ? `${lambdaParameter}:${filter}` : ''
      })`;
    }
    return clause;
  }
}
