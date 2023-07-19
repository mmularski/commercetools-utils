import { getClient } from '../factories';
import { maskLocalizedString } from '../common';
import { ShoppingList, ShoppingListChangeTextLineItemNameAction, ShoppingListSetDescriptionAction, ShoppingListSetSlugAction, ShoppingListSetTextLineItemDescriptionAction } from '@commercetools/platform-sdk';
import { HttpStatusCodes, ShoppingListUpdateActions } from '../models';
import { HttpErrorType } from '@commercetools/sdk-client-v2';
import { getShoppingList } from '../providers';
import pRetry, { AbortError } from 'p-retry';
import { faker } from '@faker-js/faker';

export const anonymizeShoppingList = async (shoppingList: ShoppingList) => {
  return pRetry(async () => action(shoppingList), {
    factor: 0.5,
    retries: 5,
    onFailedAttempt: (error) => {
      console.log(`Concurrent modification error. Retrying shopping list anonymization request... (Attempt: ${error.attemptNumber})`);
    }
  });
};

const action = async (shoppingList: ShoppingList) => {
  try {
    const [ctClient, currentShoppingList] = await Promise.all([
      getClient(), getShoppingList(shoppingList.id)
    ]);

    return ctClient.shoppingLists().withId({ ID: currentShoppingList.body.id }).post({
      body: {
        actions: [
          {
            action: ShoppingListUpdateActions.changeName,
            name: maskLocalizedString(currentShoppingList.body.name)
          },
          ...getShoppingListItemNameAction(currentShoppingList.body),
          ...getShoppingListDescriptionAction(currentShoppingList.body),
          ...getShoppingListSlugAction(currentShoppingList.body),
          ...getShoppingListItemDescriptionAction(currentShoppingList.body)
        ],
        version: currentShoppingList.body.version
      }
    }).execute();
  } catch (error) {
    const err = error as unknown as HttpErrorType;

    if (err.statusCode !== HttpStatusCodes.Conflict) {
      console.log(err);
      console.log('Request body ' + JSON.stringify(err.originalRequest.body, null, 4));
      console.log(JSON.stringify(err.body?.errors, null, 4));

      throw new AbortError(err.message);
    }

    console.log(err.message);
  }
};

const getShoppingListItemNameAction = (shoppingList: ShoppingList): ShoppingListChangeTextLineItemNameAction[] => shoppingList.textLineItems.map((textLineItem) => ({
  action: ShoppingListUpdateActions.changeTextLineItemName,
  textLineItemId: textLineItem.id,
  name: maskLocalizedString(textLineItem.name)
}));

const getShoppingListDescriptionAction = (shoppingList: ShoppingList): ShoppingListSetDescriptionAction[] => (shoppingList.description ? [
  {
    action: ShoppingListUpdateActions.setDescription,
    description: maskLocalizedString(shoppingList.description)
  } as ShoppingListSetDescriptionAction
] : []);

const getShoppingListSlugAction = (shoppingList: ShoppingList): ShoppingListSetSlugAction[] => {
  if (!shoppingList.slug) {
    return [];
  }

  const anonymizedValue = maskLocalizedString(shoppingList.slug);

  Object.keys(anonymizedValue).map((key) => anonymizedValue[key] = faker.helpers.slugify(anonymizedValue[key]));

  return [
    {
      action: ShoppingListUpdateActions.setSlug,
      slug: anonymizedValue
    } as ShoppingListSetSlugAction
  ];
};

const getShoppingListItemDescriptionAction = (shoppingList: ShoppingList): ShoppingListSetTextLineItemDescriptionAction[] => shoppingList.textLineItems.map((textLineItem) => {
  if (!Object.keys(textLineItem.description ?? {}).length) {
    return [] as unknown as ShoppingListSetTextLineItemDescriptionAction;
  }

  return {
    action: ShoppingListUpdateActions.setTextLineItemDescription,
    textLineItemId: textLineItem.id,
    description: maskLocalizedString(textLineItem.description ?? {})
  } as ShoppingListSetTextLineItemDescriptionAction;
});
