import { faker } from '@faker-js/faker';
import { createFakeCart, createFakeCustomer, createFakeOrder, createFakePayment, createFakeReview, createFakeShoppingList } from '../creators';
import pMap from 'p-map';
import { MAX_CONCURRENCY, EVENT_PROGRESS, eventEmitter } from '../common';
import pAll from 'p-all';

export const createFakeEntities = async () => {
  const customer = await createFakeCustomer();
  const cartsCount = faker.datatype.number({ max: 3, min: 0 });
  const paymentsCount = faker.datatype.number({ max: 5, min: 0 });
  const ordersCount = faker.datatype.number({ max: 5, min: 0 });
  const reviewsCount = faker.datatype.number({ max: 3, min: 0 });
  const shoppingListsCount = faker.datatype.number({ max: 3, min: 0 });

  try {
    await pAll([
      (async () => await pMap(Array(cartsCount).keys(),
        (async () => createFakeCart(customer.body.customer.id)),
        { concurrency: MAX_CONCURRENCY, stopOnError: false }
      )),
      (async () => await pMap(Array(paymentsCount).keys(),
        (async () => createFakePayment(customer.body.customer.id)),
        { concurrency: MAX_CONCURRENCY, stopOnError: false }
      )),
      (async () => await pMap(Array(ordersCount).keys(),
        (async () => {
          createFakeOrder(customer.body.customer.id);

          //Guest order + cart + payment equivalent
          createFakeOrder(undefined);
        }),
        { concurrency: MAX_CONCURRENCY, stopOnError: false }
      )),
      (async () => await pMap(Array(reviewsCount).keys(),
        (async () => createFakeReview(customer.body.customer.id)),
        { concurrency: MAX_CONCURRENCY, stopOnError: false }
      )),
      (async () => await pMap(Array(shoppingListsCount).keys(),
        (async () => createFakeShoppingList(customer.body.customer.id)),
        { concurrency: MAX_CONCURRENCY, stopOnError: false }
      )),
    ]);

    eventEmitter().emit(EVENT_PROGRESS,
      `Created customer with ID[${customer.body.customer.id}]
      ${cartsCount} fake cart objects for the customer.
      ${paymentsCount} fake payment objects for the customer.
      ${ordersCount} fake order objects for the customer.
      ${ordersCount} fake guest order objects.
      ${reviewsCount} fake review objects for the customer.
      ${shoppingListsCount} fake shopping lists objects for the customer.\n`
    );
  }
  catch (error) {
    console.log(error);
  }
};
