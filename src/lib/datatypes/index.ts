import { getToken, objectEntries } from '../utils';

type SharepointDataType =
  | 'TEXT'
  | 'MULTILINE'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'PERSON/GROUP'
  | 'DATETIME'
  | 'CHOICE'
  | 'HYPERLINK'
  | 'CURRENCY'
  | 'LOCATION'
  | 'IMAGE'
  | 'METADATA'
  | 'LOOKUP';

// type ChoiceColum = {
//   name: string;
//   type: Pick<SharepointDataType, 'TE'>
// }

type SharepointColumn = {
  name: string;
  type: SharepointDataType;
};

type List = {
  type: 'list';
  name: string;
  columns: Record<string, unknown>;
};

export function sharepoint<Schema extends Record<string, List>>(
  credentials: {
    DOMAIN: string;
    SITE_NAME: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    RESOURCE: string;
    TENANT_ID: string;
  },
  schema: Schema,
) {
  const SP_URL = `${credentials.DOMAIN}/sites/${credentials.SITE_NAME}`;
  const SP_AUTH_API = `https://accounts.accesscontrol.windows.net/${credentials.TENANT_ID}/tokens/OAuth/2`;
  let accessToken: string;
  let tokenExpiration: number;
  async function query() {
    if (
      !(accessToken && tokenExpiration) ||
      tokenExpiration - Date.now() <= 1
    ) {
      const tokenData = await getToken({ ...credentials, SP_AUTH_API });
      accessToken = tokenData.access_token;
      tokenExpiration = tokenData.expires_on * 1000;
    }
  }
  const entries = objectEntries(schema);
  const output = {} as {
    [K in keyof Schema]: {
      query: typeof query;
    } & Schema[keyof Schema];
  };
  entries.forEach(([key, value]) => {
    output[key] = {
      query: query,
      ...value,
    };
  });
  return output;
}

// const yo = list('list1', {
//   col1: text('col1'),
// });
// const idk = sharepoint(
//   {
//     DOMAIN: process.env.SP_DOMAIN!,
//     SITE_NAME: 'IRM-DEV',
//     CLIENT_ID: process.env.CLIENT_ID!,
//     CLIENT_SECRET: process.env.CLIENT_SECRET!,
//     RESOURCE: process.env.RESOURCE!,
//     TENANT_ID: process.env.TENANT_ID!,
//   },
//   { yo },
// );
// await idk.yo.query

export function list<Columns extends Record<string, unknown>>(
  name: string,
  columns: Columns,
): List {
  return {
    type: 'list',
    name,
    columns,
  };
}

export function text(name: string): SharepointColumn {
  return {
    name,
    type: 'TEXT',
  };
}

export function multiline(name: string): SharepointColumn {
  return {
    name,
    type: 'MULTILINE',
  };
}

export function number(name: string): SharepointColumn {
  return {
    name,
    type: 'NUMBER',
  };
}

export function boolean(name: string): SharepointColumn {
  return {
    name,
    type: 'BOOLEAN',
  };
}

export function personOrGroup(name: string): SharepointColumn {
  return {
    name,
    type: 'PERSON/GROUP',
  };
}

export function datetime(name: string): SharepointColumn {
  return {
    name,
    type: 'DATETIME',
  };
}

export function choice<T extends string[]>(
  name: string,
  options?: { choices: T },
): SharepointColumn {
  return {
    name,
    options,
    type: 'CHOICE',
  };
}

export function hyperlink(name: string): SharepointColumn {
  return {
    name,
    type: 'HYPERLINK',
  };
}

export function currency(name: string): SharepointColumn {
  return {
    name,
    type: 'CURRENCY',
  };
}

export function location(name: string): SharepointColumn {
  return {
    name,
    type: 'LOCATION',
  };
}

export function image(name: string): SharepointColumn {
  return {
    name,
    type: 'IMAGE',
  };
}

export function metadata(name: string): SharepointColumn {
  return {
    name,
    type: 'METADATA',
  };
}

export function lookup(name: string): SharepointColumn {
  return {
    name,
    type: 'LOOKUP',
  };
}
