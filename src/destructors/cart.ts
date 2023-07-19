import { getClient } from '../factories';
import { Cart } from '@commercetools/platform-sdk';

export const destroyCart = async (cart: Cart) => {
  const ctClient = await getClient();

  return ctClient.carts()
    .withId({ ID: cart.id })
    .delete({
      queryArgs: {
        version: cart.version
      }
    })
    .execute();
};
