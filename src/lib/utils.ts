type Credentials = {
  DOMAIN: string;
  SITE_NAME: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  RESOURCE: string;
  TENANT_ID: string;
};
export const getToken = async (
  credentials: Credentials & { SP_AUTH_API: string },
) => {
  const formData = new FormData();
  formData.append('grant_type', 'client_credentials');
  formData.append(
    'client_id',
    `${credentials.CLIENT_ID}@${credentials.TENANT_ID}`,
  );
  formData.append('client_secret', credentials.CLIENT_SECRET);
  formData.append(
    'resource',
    `${credentials.RESOURCE}/${credentials.DOMAIN}@${credentials.TENANT_ID}`,
  );

  const tokenRequest = await fetch(credentials.SP_AUTH_API, {
    method: 'POST',
    body: formData,
  });

  const tokenData = (await tokenRequest.json()) as {
    access_token: string;
    expires_on: number;
  };
  return tokenData;
};

export function objectValues<T extends { [x: string]: unknown }>(object: T) {
  return Object.keys(object) as T[keyof T][];
}

export function objectKeys<T extends Record<string, unknown> | unknown[]>(
  object: T,
) {
  return Object.keys(object) as (keyof T)[];
}

export function objectEntries<T extends Record<string, unknown>>(object: T) {
  return Object.entries(object) as [keyof T, T[keyof T]][];
}

// operators

type Equal = 'eq';
type NotEqual = 'ne';
type GreaterThan = 'gt';
type GreaterThanOrEqual = 'ge';
type LessThan = 'lt';
type LessThanOrEqual = 'le2';
type And = 'and';
type or = 'or';
type Not = 'not';
type Has = 'has';
type In = 'in';
