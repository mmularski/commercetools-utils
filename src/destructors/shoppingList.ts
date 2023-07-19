import { getClient } from '../factories';
import { ShoppingList } from '@commercetools/platform-sdk';

export const destroyShoppingList = async (shoppingList: ShoppingList) => {
  const ctClient = await getClient();

  return ctClient.shoppingLists()
    .withId({ ID: shoppingList.id })
    .delete({
      queryArgs: {
        version: shoppingList.version
      }
    })
    .execute();
};
