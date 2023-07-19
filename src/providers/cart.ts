import { CartPagedQueryResponse, ClientResponse } from '@commercetools/platform-sdk';
import { getClient } from '../factories';

export const getCart = async (cartId: string) => {
  const client = await getClient();

  return client.carts().withId({ ID: cartId }).get().execute();
};

export const getCustomerCarts = async (customerId: string, limit: number, lastId?: string) => {
  const client = await getClient();
  const response: ClientResponse<CartPagedQueryResponse> = await client.carts().get({
    queryArgs: {
      withTotal: false,
      sort: 'id ASC',
      limit,
      where: [`customerId = "${customerId}"`, ...(lastId ? [`id > "${lastId}"`] : [])]
    }
  }).execute();

  return response.body.results;
};

export const getCarts = async (limit: number, lastId?: string, fromId?: boolean) => {
  const client = await getClient();
  const response: ClientResponse<CartPagedQueryResponse> = await client.carts().get({
    queryArgs: {
      withTotal: false,
      sort: 'id ASC',
      limit,
      where: [...(lastId ? [`id >${fromId ? '=' : ''} "${lastId}"`] : [])]
    }
  }).execute();

  return response.body.results;
};

export const getCartsCount = async () => {
  const client = await getClient();
  const { body: { total } }: ClientResponse<CartPagedQueryResponse> = await client.carts().get({
    queryArgs: {
      withTotal: true
    }
  }).execute();

  return total ?? 0;
};