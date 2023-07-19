import { ClientResponse, OrderPagedQueryResponse } from '@commercetools/platform-sdk';
import { getClient } from '../factories';

export const getOrder = async (orderId: string) => {
  const client = await getClient();

  return client.orders().withId({ ID: orderId }).get().execute();
};

export const getCustomerOrders = async (customerId: string, limit: number, lastId?: string) => {
  const client = await getClient();
  const response: ClientResponse<OrderPagedQueryResponse> = await client.orders().get({
    queryArgs: {
      withTotal: false,
      sort: 'id ASC',
      limit,
      where: [`customerId = "${customerId}"`, ...(lastId ? [`id > "${lastId}"`] : [])]
    }
  }).execute();

  return response.body.results;
};

export const getOrders = async (limit: number, lastId?: string, fromId?: boolean) => {
  const client = await getClient();
  const response: ClientResponse<OrderPagedQueryResponse> = await client.orders().get({
    queryArgs: {
      withTotal: false,
      sort: 'id ASC',
      limit,
      where: [...(lastId ? [`id >${fromId ? '=' : ''} "${lastId}"`] : [])]
    }
  }).execute();

  return response.body.results;
};

export const getOrdersCount = async () => {
  const client = await getClient();
  const { body: { total } }: ClientResponse<OrderPagedQueryResponse> = await client.orders().get({
    queryArgs: {
      withTotal: true
    }
  }).execute();

  return total ?? 0;
};