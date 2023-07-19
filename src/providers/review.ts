import { ClientResponse, ReviewPagedQueryResponse } from '@commercetools/platform-sdk';
import { getClient } from '../factories';

export const getReview = async (reviewId: string) => {
  const client = await getClient();

  return client.reviews().withId({ ID: reviewId }).get().execute();
};

export const getCustomerReviews = async (customerId: string, limit: number, lastId?: string) => {
  const client = await getClient();
  const response: ClientResponse<ReviewPagedQueryResponse> = await client.reviews().get({
    queryArgs: {
      withTotal: false,
      sort: 'id ASC',
      limit,
      where: [`customer(id = "${customerId}")`, ...(lastId ? [`id > "${lastId}"`] : [])]
    }
  }).execute();

  return response.body.results;
};

export const getReviews = async (limit: number, lastId?: string, fromId?: boolean) => {
  const client = await getClient();
  const response: ClientResponse<ReviewPagedQueryResponse> = await client.reviews().get({
    queryArgs: {
      withTotal: false,
      sort: 'id ASC',
      limit,
      where: [...(lastId ? [`id >${fromId ? '=' : ''} "${lastId}"`] : [])]
    }
  }).execute();

  return response.body.results;
};

export const getReviewsCount = async () => {
  const client = await getClient();
  const { body: { total } }: ClientResponse<ReviewPagedQueryResponse> = await client.reviews().get({
    queryArgs: {
      withTotal: true
    }
  }).execute();

  return total ?? 0;
};