import { Cart, ClientResponse, Customer, Order, Review, ShoppingList } from '@commercetools/platform-sdk';
import pAll from 'p-all';
import pMap from 'p-map';
import { anonymizeCart, anonymizeCustomer, anonymizeOrder, anonymizeReview, anonymizeShoppingList, anonymizeCustomer as customerAnonymizer } from '../anonymizers';
import { AnonymizeEntityActMode, AnonymizeEntityConfig, EVENT_PROGRESS, MAX_CONCURRENCY, eventEmitter } from '../common';
import { destroyCart } from '../destructors';
import { CartState, TypeId } from '../models';
import { getCart, getCarts, getCustomer, getCustomerCarts, getCustomerOrders, getCustomerReviews, getCustomerShoppingLists, getCustomers, getOrder, getOrders, getReview, getReviews, getShoppingList, getShoppingLists } from '../providers';

export const anonymizeWholeCustomer = async (customer: Customer, removeOrderedCarts: boolean, batchSize: number) => {
  await pAll([
    (async () => await processCustomerBatchEntityAnonymization<Review>(getCustomerReviews, anonymizeReview, customer.id, batchSize)),
    (async () => await processCustomerBatchEntityAnonymization<ShoppingList>(getCustomerShoppingLists, anonymizeShoppingList, customer.id, batchSize)),
    (async () => await processCustomerBatchEntityAnonymization<Order>(getCustomerOrders, anonymizeOrder, customer.id, batchSize)),
    (async () => await processBatchCustomerCartAnonymization(batchSize, removeOrderedCarts, customer.id)),
    (async () => await customerAnonymizer(customer)),
  ], { concurrency: MAX_CONCURRENCY, stopOnError: true });

  eventEmitter().emit(EVENT_PROGRESS,
    `Customer with ID[${customer.id}] and all personal resources has been successfully anonymized. \n`
  );
};

export const anonymizeEntity = async (entity: TypeId, removeOrderedCarts: boolean, batchSize: number, entityConfig: AnonymizeEntityConfig) => {
  switch (entity) {
    case TypeId.Customer:
      await processBatchEntityAnonymization<Customer>(getCustomers, getCustomer, anonymizeCustomer, batchSize, entityConfig);
      break;

    case TypeId.Order:
      await processBatchEntityAnonymization<Order>(getOrders, getOrder, anonymizeOrder, batchSize, entityConfig);
      break;

    case TypeId.Rewiew:
      await processBatchEntityAnonymization<Review>(getReviews, getReview, anonymizeReview, batchSize, entityConfig);
      break;

    case TypeId.ShoppingList:
      await processBatchEntityAnonymization<ShoppingList>(getShoppingLists, getShoppingList, anonymizeShoppingList, batchSize, entityConfig);
      break;

    case TypeId.Cart:
      await processBatchCartAnonymization(batchSize, removeOrderedCarts, entityConfig);
      break;

    default:
      break;
  }
};

const processCustomerBatchEntityAnonymization = async <Entity extends { id: string }>(
  fetchCallback: (customerId: string, limit: number, lastId?: string) => Promise<Entity[]>,
  anonymizeCallback: (entity: Entity) => Promise<ClientResponse<Entity> | undefined>,
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

    await pMap(entities, (async (entity) => {
      await anonymizeCallback(entity);
    }), { concurrency: MAX_CONCURRENCY, stopOnError: true });
  }
};

const processBatchCustomerCartAnonymization = async (batchSize: number, removeOrderedCarts: boolean, customerId: string) => {
  let isLastBatch = false;
  let lastId = undefined;

  while (!isLastBatch) {
    const carts: Cart[] = await getCustomerCarts(customerId, batchSize, lastId) ?? [];
    lastId = carts.at(-1)?.id;

    if (carts.length < batchSize) {
      isLastBatch = true;
    }

    await pMap(carts, (async (cart) => {
      if (cart.cartState !== CartState.Active && removeOrderedCarts) {
        await destroyCart(cart);
      } else {
        if (cart.cartState !== CartState.Active) {
          //Do nothing
          return;
        }

        await anonymizeCart(cart);
      }
    }), { concurrency: MAX_CONCURRENCY, stopOnError: true });
  }
};

const processBatchEntityAnonymization = async <Entity extends { id: string }>(
  fetchMultipleCallback: (limit: number, lastId?: string, fromId?: boolean) => Promise<Entity[]>,
  fetchOneCallback: (id: string) => Promise<ClientResponse<Entity>>,
  anonymizeCallback: (entity: Entity) => Promise<ClientResponse<Entity> | undefined>,
  batchSize: number,
  entityConfig: AnonymizeEntityConfig
) => {
  let isLastBatch = false;
  let lastId = entityConfig.mode === AnonymizeEntityActMode.FromID ? entityConfig.id : undefined;

  while (!isLastBatch) {
    const entities: Entity[] = (entityConfig.mode === AnonymizeEntityActMode.ID && entityConfig.id ?
      [(await fetchOneCallback(entityConfig.id)).body] :
      await fetchMultipleCallback(batchSize, lastId, entityConfig.mode === AnonymizeEntityActMode.FromID ? true : false)
    ) ?? [];

    lastId = entities.at(-1)?.id;

    if (entities.length < batchSize) {
      isLastBatch = true;
    }

    await pMap(entities, (async (entity) => {
      await anonymizeCallback(entity);

      eventEmitter().emit(EVENT_PROGRESS,
        `Entity with ID [${entity.id}] has been successfully anonymized.`
      );
    }), { concurrency: MAX_CONCURRENCY, stopOnError: true });
  }
};

const processBatchCartAnonymization = async (batchSize: number, removeOrderedCarts: boolean, entityConfig: AnonymizeEntityConfig) => {
  let isLastBatch = false;
  let lastId = entityConfig.mode === AnonymizeEntityActMode.FromID ? entityConfig.id : undefined;

  while (!isLastBatch) {
    const carts: Cart[] = entityConfig.mode === AnonymizeEntityActMode.ID && entityConfig.id ?
      [(await getCart(entityConfig.id)).body] :
      await getCarts(batchSize, lastId, entityConfig.mode === AnonymizeEntityActMode.FromID ? true : false)
      ?? [];

    lastId = carts.at(-1)?.id;

    if (carts.length < batchSize) {
      isLastBatch = true;
    }

    await pMap(carts, (async (cart) => {
      if (cart.cartState === CartState.Active) {
        await anonymizeCart(cart);

        eventEmitter().emit(EVENT_PROGRESS,
          `Entity with ID [${cart.id}] has been successfully anonymized.`
        );
      } else if (removeOrderedCarts) {
        await destroyCart(cart);

        eventEmitter().emit(EVENT_PROGRESS,
          `Entity with ID [${cart.id}] has been successfully destroyed.`
        );
      }
    }), { concurrency: MAX_CONCURRENCY, stopOnError: true });
  }
};
