import { getClient } from '../factories';
import { Order, OrderSetBillingAddressAction, OrderSetCustomerEmailAction, OrderSetDeliveryAddressAction, OrderSetShippingAddressAction, OrderUpdateItemShippingAddressAction } from '@commercetools/platform-sdk';
import { anonymizeAddress } from './address';
import { maskEmail } from '../common';
import { HttpErrorType } from '@commercetools/sdk-client-v2';
import pRetry, { AbortError } from 'p-retry';
import { getOrder } from '../providers';
import { HttpStatusCodes, OrderUpdateActions } from '../models';

export const anonymizeOrder = async (order: Order) => {
  return pRetry(async () => action(order), {
    factor: 0.5,
    retries: 5,
    onFailedAttempt: (error) => {
      console.log(`Concurrent modification error. Retrying order anonymization request... (Attempt: ${error.attemptNumber})`);
    }
  });
};

const action = async (order: Order) => {
  try {
    const [ctClient, currentOrder] = await Promise.all([
      getClient(), getOrder(order.id)
    ]);

    return ctClient.orders().withId({ ID: currentOrder.body.id }).post({
      body: {
        actions: [
          ...getOrderBillingAddressAction(currentOrder.body),
          ...getOrderShippingAddressAction(currentOrder.body),
          ...getOrderCustomerEmailAction(currentOrder.body),
          ...getOrderDeliveryAddressActions(currentOrder.body),
          ...getItemShippingAddressesActions(currentOrder.body)
        ],
        version: currentOrder.body.version
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

const getOrderBillingAddressAction = (order: Order): OrderSetBillingAddressAction[] => (order.billingAddress ? [
  {
    action: OrderUpdateActions.setBillingAddress,
    address: anonymizeAddress(order.billingAddress)
  } as OrderSetBillingAddressAction
] : []);

const getOrderShippingAddressAction = (order: Order): OrderSetShippingAddressAction[] => (order.shippingAddress ? [
  {
    action: OrderUpdateActions.setShippingAddress,
    address: anonymizeAddress(order.shippingAddress)
  } as OrderSetShippingAddressAction
] : []);

const getOrderCustomerEmailAction = (order: Order): OrderSetCustomerEmailAction[] => (order.customerEmail ? [
  {
    action: OrderUpdateActions.setCustomerEmail,
    email: maskEmail(order.customerEmail)
  } as OrderSetCustomerEmailAction
] : []);

const getOrderDeliveryAddressActions = (order: Order): OrderSetDeliveryAddressAction[] => {
  const result: OrderSetDeliveryAddressAction[] = [];
  const deliveries = order.shippingInfo?.deliveries ?? [];

  if (deliveries.length === 0) {
    return result;
  }

  for (const delivery of deliveries) {
    if (!delivery.address) {
      continue;
    }

    result.push({
      action: OrderUpdateActions.setDeliveryAddress,
      deliveryId: delivery.id,
      address: anonymizeAddress(delivery.address)
    });
  }

  return result;
};

const getItemShippingAddressesActions = (order: Order): OrderUpdateItemShippingAddressAction[] => (order.itemShippingAddresses ?
  order.itemShippingAddresses.map((itemAddress) => (
    {
      action: OrderUpdateActions.updateItemShippingAddress,
      address: anonymizeAddress(itemAddress)
    }
  )) : []);
