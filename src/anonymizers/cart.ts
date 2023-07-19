import { Cart, CartSetBillingAddressAction, CartSetCustomerEmailAction, CartSetShippingAddressAction, CartUpdateItemShippingAddressAction } from '@commercetools/platform-sdk';
import { maskEmail } from '../common';
import { getClient } from '../factories';
import { anonymizeAddress } from '../anonymizers';
import { CartUpdateActions, HttpStatusCodes } from '../models';
import { HttpErrorType } from '@commercetools/sdk-client-v2';
import pRetry, { AbortError } from 'p-retry';
import { getCart } from '../providers';

export const anonymizeCart = async (cart: Cart) => {
  return pRetry(async () => action(cart), {
    factor: 0.5,
    retries: 5,
    onFailedAttempt: (error) => {
      console.log(`Concurrent modification error. Retrying cart anonymization request... (Attempt: ${error.attemptNumber})`);
    }
  });
};

const action = async (cart: Cart) => {
  try {
    const [ctClient, currentCart] = await Promise.all([
      getClient(), getCart(cart.id)
    ]);

    return ctClient.carts().withId({ ID: currentCart.body.id }).post({
      body: {
        actions: [
          ...getCustomerEmailAction(currentCart.body),
          ...getBillingAddressAction(currentCart.body),
          ...getShippingAddressAction(currentCart.body),
          ...getItemShippingAddressesActions(currentCart.body),
        ],
        version: currentCart.body.version
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

const getCustomerEmailAction = (cart: Cart): CartSetCustomerEmailAction[] => (cart.customerEmail ? [
  {
    action: CartUpdateActions.setCustomerEmail,
    email: maskEmail(cart.customerEmail)
  } as CartSetCustomerEmailAction
] : []);

const getBillingAddressAction = (cart: Cart): CartSetBillingAddressAction[] => (cart.billingAddress ? [
  {
    action: CartUpdateActions.setBillingAddress,
    address: anonymizeAddress(cart.billingAddress)
  } as CartSetBillingAddressAction
] : []);

const getShippingAddressAction = (cart: Cart): CartSetShippingAddressAction[] => (cart.shippingAddress ? [
  {
    action: CartUpdateActions.setShippingAddress,
    address: anonymizeAddress(cart.shippingAddress)
  } as CartSetShippingAddressAction
] : []);

const getItemShippingAddressesActions = (cart: Cart): CartUpdateItemShippingAddressAction[] => (cart.itemShippingAddresses ?
  cart.itemShippingAddresses.map((itemAddress) => (
    {
      action: CartUpdateActions.updateItemShippingAddress,
      address: anonymizeAddress(itemAddress)
    }
  )) : []);
