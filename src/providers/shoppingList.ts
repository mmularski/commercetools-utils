import { ClientResponse, ShoppingListPagedQueryResponse } from '@commercetools/platform-sdk';
import { getClient } from '../factories';

export const getShoppingList = async (shoppingListId: string) => {
  const client = await getClient();

  return client.shoppingLists().withId({ ID: shoppingListId }).get().execute();
};

export const getCustomerShoppingLists = async (customerId: string, limit: number, lastId?: string) => {
  const client = await getClient();
  const response: ClientResponse<ShoppingListPagedQueryResponse> = await client.shoppingLists().get({
    queryArgs: {
      withTotal: false,
      sort: 'id ASC',
      limit,
      where: [`customer(id = "${customerId}")`, ...(lastId ? [`id > "${lastId}"`] : [])]
    }
  }).execute();

  return response.body.results;
};

export const getShoppingLists = async (limit: number, lastId?: string, fromId?: boolean) => {
  const client = await getClient();
  const response: ClientResponse<ShoppingListPagedQueryResponse> = await client.shoppingLists().get({
    queryArgs: {
      withTotal: false,
      sort: 'id ASC',
      limit,
      where: [...(lastId ? [`id >${fromId ? '=' : ''} "${lastId}"`] : [])]
    }
  }).execute();

  return response.body.results;
};

export const getShoppingListsCount = async () => {
  const client = await getClient();
  const { body: { total } }: ClientResponse<ShoppingListPagedQueryResponse> = await client.shoppingLists().get({
    queryArgs: {
      withTotal: true
    }
  }).execute();

  return total ?? 0;
};
