import { ClientResponse, CustomerPagedQueryResponse } from '@commercetools/platform-sdk';
import { getClient } from '../factories';

export const getCustomer = async (customerId: string) => {
  const client = await getClient();

  return client.customers().withId({ ID: customerId }).get().execute();
};

export const getCustomers = async (limit: number, lastId?: string, fromId?: boolean) => {
  const client = await getClient();
  const response: ClientResponse<CustomerPagedQueryResponse> = await client.customers().get({
    queryArgs: {
      withTotal: false,
      sort: 'id ASC',
      limit,
      ...(lastId && { where: `id >${fromId ? '=' : ''} "${lastId}"` })
    }
  }).execute();

  return response.body.results;
};

export const getCustomersCount = async () => {
  const client = await getClient();
  const { body: { total } }: ClientResponse<CustomerPagedQueryResponse> = await client.customers().get({
    queryArgs: {
      withTotal: true
    }
  }).execute();

  return total ?? 0;
};
