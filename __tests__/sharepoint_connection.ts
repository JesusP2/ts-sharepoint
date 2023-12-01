import test from 'node:test';
import assert from 'node:assert/strict';
import { getToken, type ErrorSchema } from './helpers';

const listUrl = `${process.env.SP_URL}/_api/web/lists/getbytitle('test')/items`;
test.describe('Sharepoint tests', async () => {
  const tokenData = await getToken();
  const accessToken = tokenData.access_token;
  const tokenExpiration = tokenData.expires_on * 1000;

  test('check token is valid', async () => {
    const res = await fetch(listUrl, {
      headers: {
        Accept: 'application/json;odata=nometadata',
        Authorization: 'Bearer ' + accessToken,
      },
    });
    if (!res.ok) {
      const msg = `Status: ${res.status}, Status text: ${res.statusText}`
      assert.fail(msg);
    }
    const data = (await res.json()) as { value: unknown[] };
    assert.equal(Array.isArray(data.value), true);
  });

  test('check error schema', async () => {
    const res = await fetch(listUrl + '?$select=InvalidColumn', {
      headers: {
        Accept: 'application/json;odata=nometadata',
        Authorization: 'Bearer ' + accessToken,
      },
    });
    if (!res.ok) {
      const error = (await res.json()) as ErrorSchema;
      assert.deepStrictEqual(error, {
        'odata.error': {
          code: '-1, Microsoft.SharePoint.SPException',
          message: {
            lang: 'en-US',
            value: "The field or property 'InvalidColumn' does not exist.",
          },
        },
      });
    }
  });
});
