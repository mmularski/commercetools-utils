import { ClientResponse, PaymentPagedQueryResponse } from '@commercetools/platform-sdk';
import { getClient } from '../factories';

export const getCustomerPayments = async (customerId: string, limit: number, lastId?: string) => {
  const client = await getClient();
  const response: ClientResponse<PaymentPagedQueryResponse> = await client.payments().get({
    queryArgs: {
      withTotal: false,
      sort: 'id ASC',
      limit,
      where: [`customer(id = "${customerId}")`, ...(lastId ? [`id > "${lastId}"`] : [])]
    }
  }).execute();

  return response.body.results;
};

export const getPayments = async (limit: number, lastId?: string, fromId?: boolean) => {
  const client = await getClient();
  const response: ClientResponse<PaymentPagedQueryResponse> = await client.payments().get({
    queryArgs: {
      withTotal: false,
      sort: 'id ASC',
      limit,
      where: [...(lastId ? [`id >${fromId ? '=' : ''} "${lastId}"`] : [])]
    }
  }).execute();

  return response.body.results;
};

export const getPaymentsCount = async () => {
  const client = await getClient();
  const { body: { total } }: ClientResponse<PaymentPagedQueryResponse> = await client.payments().get({
    queryArgs: {
      withTotal: true
    }
  }).execute();

  return total ?? 0;
};