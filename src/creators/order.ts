import { faker } from '@faker-js/faker';
import { getClient } from '../factories';
import { createFakeCart } from './cart';
import { createFakePayment } from './payment';
import { getFakeAddress } from './address';
import { CartUpdateActions, OrderState, PaymentState, ShipmentState, TypeId } from '../models';

export const createFakeOrder = async (customerId?: string) => {
  const ctClient = await getClient();

  let cart = (await createFakeCart(customerId)).body;
  const payment = (await createFakePayment(customerId)).body;

  cart = (await ctClient.carts().withId({ ID: cart.id }).post({
    body: {
      actions: [
        {
          action: CartUpdateActions.addPayment,
          payment: {
            typeId: TypeId.Payment,
            id: payment.id
          }
        },
        {
          action: CartUpdateActions.setShippingAddress,
          address: getFakeAddress()
        },
        {
          action: CartUpdateActions.setBillingAddress,
          address: getFakeAddress()
        }
      ],
      version: cart.version
    }
  }).execute()).body;

  return ctClient.orders().post({
    body: {
      cart: {
        typeId: TypeId.Cart,
        id: cart.id
      },
      orderNumber: faker.random.alphaNumeric(20),
      version: cart.version,
      orderState: faker.helpers.arrayElement(Object.values(OrderState)),
      paymentState: faker.helpers.arrayElement(Object.values(PaymentState)),
      shipmentState: faker.helpers.arrayElement(Object.values(ShipmentState)),
    }
  }).execute();
};
