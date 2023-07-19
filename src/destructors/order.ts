import { getClient } from '../factories';
import { Order } from '@commercetools/platform-sdk';

export const destroyOrder = async (order: Order) => {
  const ctClient = await getClient();

  return ctClient.orders()
    .withId({ ID: order.id })
    .delete({
      queryArgs: {
        version: order.version
      }
    })
    .execute();
};
