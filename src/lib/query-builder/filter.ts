// import type {CustomType,  } from './types';
// import {
//   BOOLEAN_FUNCTIONS,
//   LOGICAL_OPERATORS,
//   type ComparisonOperators,
// } from './utils';

// type List20 = {
//   SomeProp: number;
// }
//
// const key: Key<List20> = {
//   SomeProp: '3'
// }

// export type QueryOptions<T> = ExpandOptions<T> & {
//   search: string; // done
//   skiptoken: string; // done
//   transform: PlainObject | PlainObject[]; // done
//   key: string | number | PlainObject; // done
//   action: string; // done
//   func: string | { [functionName: string]: { [parameterName: string]: any } }; // done
//   format: string; // done
// };

// type List4 = {
//   SomeCollection: string;
// };
// const someCollection = alias('SomeCollection', ['Sean', 'Jason']);
// const func: Funct<List4> = {
//   Test: { SomeCollection: someCollection },
// };
// const func2: Funct<List4> = {
//   Test: { SomeCollection: ['One', 'Two', 'Three'] },
// };
// const someCollection2 = alias(
//   'SomeCollection',
//   json([{ Name: 'Sean' }, { Name: 'Jason' }]),
// );
//
// const func3 = {
//   Test: { SomeCollection: someCollection },
// };

// type List3 = {
//   Friends: string;
//   Photos: string;
//   Foo: string;
//   Bar: string;
//   Baz: string;
//   One: string;
//   Two: string;
// };
// const expand: Expand<List3> = { Friends: { expand: 'Photos' } };
//
// const expand2: Expand<List3> = { Friends: {}, One: { orderBy: 'Two' } };
//
// const expand3: Expand<List3> = [
//   { Friends: { expand: 'Photos' } },
//   { Foo: { expand: { Bar: { expand: { Baz: { skip: 10 } } } } } },
//   // 'Foo/Bar/Baz',
// ];

// type List = {
//   SomeProp: string;
//   PropName: number;
//   Id: string;
//   Total: string;
// };
//
//
// type List2 = {
//   SomeProps2: number;
//   SomeProps: number;
//   FooProp: string;
//   BarProp: string;
//   FooBarProp: number;
// }
// export const filter: Filter<List2> = {
//   and: [
//     { or: [{ SomeProps: 1 }, { SomeProps2: 2 }, { not: { FooProp: { startswith: 'foo' }}}] },
//     { not: { FooProp: { startswith: 'foo' } } },
//     { not: { BarProp: { startswith: 'bar' } } },
//     { FooBarProp: { startswith: 'foobar' } },
//   ],
// };
//
// export const transform: Transform<List> = [
//   {
//     filter: {
//       PropName: 1,
//     },
//   },
//   {
//     groupBy: {
//       properties: ['SomeProp'],
//       transform: [
//         {
//           aggregate: {
//             Id: {
//               with: 'countdistinct',
//               as: 'Total',
//             },
//           },
//         },
//       ],
//     },
//   },
//   {
//     filter: {
//       SomeProp: 'hi',
//       Total: { ge: 5 },
//     },
//   },
// ];
