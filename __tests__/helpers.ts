export const getToken = async () => {
  const formData = new FormData();
  formData.append('grant_type', 'client_credentials');
  formData.append(
    'client_id',
    `${process.env.CLIENT_ID}@${process.env.TENANT_ID}`,
  );
  formData.append('client_secret', process.env.CLIENT_SECRET);
  formData.append(
    'resource',
    `${process.env.RESOURCE}/${process.env.SP_DOMAIN}@${process.env.TENANT_ID}`,
  );

  const tokenRequest = await fetch(process.env.SP_AUTH_API as string, {
    method: 'POST',
    body: formData,
  });

  const tokenData = (await tokenRequest.json()) as {
    access_token: string;
    expires_on: number;
  };
  return tokenData;
};

export type ErrorSchema = {
  'odata.error': {
    code: `${string}, ${string}`;
    message: {
      lang: string;
      value: string;
    };
  };
};
