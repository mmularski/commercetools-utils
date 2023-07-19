import { Cart, ClientResponse, Customer, Order, Payment, Review, ShoppingList } from '@commercetools/platform-sdk';
import boxen from 'boxen';
import pMap from 'p-map';
import { EVENT_PROGRESS, MAX_CONCURRENCY, eventEmitter } from '../common';
import { destroyCustomer as customerDestroyer, destroyCart, destroyOrder, destroyPayment, destroyReview, destroyShoppingList } from '../destructors';
import { getCarts, getCustomerCarts, getCustomerOrders, getCustomerPayments, getCustomerReviews, getCustomerShoppingLists, getOrders, getPayments, getReviews, getShoppingLists } from '../providers';

export const destroyCustomer = async (customer: Customer, batchSize: number) => {
  try {
    await processBatchEntityDestroy<Review>(getCustomerReviews, destroyReview, customer.id, batchSize);
    await processBatchEntityDestroy<ShoppingList>(getCustomerShoppingLists, destroyShoppingList, customer.id, batchSize);
    await processBatchEntityDestroy<Order>(getCustomerOrders, destroyOrder, customer.id, batchSize);
    await processBatchEntityDestroy<Cart>(getCustomerCarts, destroyCart, customer.id, batchSize);
    await processBatchEntityDestroy<Payment>(getCustomerPayments, destroyPayment, customer.id, batchSize);
    await customerDestroyer(customer);
  } catch (error) {
    console.log(error);
  }

  eventEmitter().emit(EVENT_PROGRESS, `Customer with ID[${customer.id}] has been successfully removed with all dependant data.\n`);
};

export const destroyGuests = async (batchSize: number) => {
  console.log(boxen('Starting guests destruction. This may take a while...',
    { borderColor: 'blue', title: 'INFO', padding: 1 })
  );

  try {
    await processBatchGuestEntityDestroy<Review>(getReviews, destroyReview, batchSize);
    await processBatchGuestEntityDestroy<ShoppingList>(getShoppingLists, destroyShoppingList, batchSize);
    await processBatchGuestEntityDestroy<Order>(getOrders, destroyOrder, batchSize);
    await processBatchGuestEntityDestroy<Cart>(getCarts, destroyCart, batchSize);
    await processBatchGuestEntityDestroy<Payment>(getPayments, destroyPayment, batchSize);
  } catch (error) {
    console.log(error);
  }
};

const processBatchEntityDestroy = async <Entity extends { id: string }>(
  fetchCallback: (customerId: string, limit: number, lastId?: string) => Promise<Entity[]>,
  destroyCallback: (entity: Entity) => Promise<ClientResponse<Entity>>,
  customerId: string,
  batchSize: number
) => {
  let isLastBatch = false;
  let lastId = undefined;

  while (!isLastBatch) {
    const entities: Entity[] = await fetchCallback(customerId, batchSize, lastId) ?? [];
    lastId = entities.at(-1)?.id;

    if (entities.length < batchSize) {
      isLastBatch = true;
    }

    try {
      await pMap(entities, (async (entity) => {
        await destroyCallback(entity);
      }), { concurrency: MAX_CONCURRENCY, stopOnError: false });
    } catch (error) {
      console.log(error);
    }
  }
};

const processBatchGuestEntityDestroy = async <Entity extends { id: string }>(
  fetchCallback: (limit: number, lastId?: string) => Promise<Entity[]>,
  destroyCallback: (entity: Entity) => Promise<ClientResponse<Entity>>,
  batchSize: number
) => {
  let isLastBatch = false;
  let lastId = undefined;

  while (!isLastBatch) {
    //Add a minimalistic verbose info, that mechanism is still working...
    process.stdout.write('.');

    const entities: Entity[] = await fetchCallback(batchSize, lastId) ?? [];
    lastId = entities.at(-1)?.id;

    if (entities.length < batchSize) {
      isLastBatch = true;
    }

    try {
      await pMap(entities, (async (entity) => {
        await destroyCallback(entity);
      }), { concurrency: MAX_CONCURRENCY, stopOnError: false });
    } catch (error) {
      console.log(error);
    }
  }
};