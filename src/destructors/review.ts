import { getClient } from '../factories';
import { Review } from '@commercetools/platform-sdk';

export const destroyReview = async (review: Review) => {
  const ctClient = await getClient();

  return ctClient.reviews()
    .withId({ ID: review.id })
    .delete({
      queryArgs: {
        version: review.version
      }
    })
    .execute();
};
