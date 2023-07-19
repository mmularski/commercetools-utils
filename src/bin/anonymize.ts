import boxen from 'boxen';
import inquirer from 'inquirer';
import { AnonymizeActMode, AnonymizeEntityActMode, AnonymizeEntityConfig, Config, RemoveOrderedCarts, setupProgressSubscriber } from '../common';
import { TypeId } from '../models';
import { getCartsCount, getCustomer, getCustomersCount, getOrdersCount, getPaymentsCount, getReviewsCount, getShoppingListsCount } from '../providers';
import { anonymizeEntity, anonymizeWholeCustomer } from '../services';

export const anonymize = async (config: Config) => {
  const anonymizeActMode = (await inquirer.prompt({
    type: 'list',
    name: 'mode',
    message: 'What do you want to anonymize?',
    choices: Object.values(AnonymizeActMode),
    default: AnonymizeActMode.OneCustomer
  })).mode as AnonymizeActMode;

  let removeOrderedCarts = RemoveOrderedCarts.No;

  // Anonymization of only one customer with all dependant data(orders, carts, shopping lists, rewievs)
  if (anonymizeActMode === AnonymizeActMode.OneCustomer) {
    setupProgressSubscriber(1);

    const customerId = (await (inquirer.prompt({
      type: 'input',
      name: 'customerId',
      message: 'Provide the customer ID you want to anonymize'
    }))).customerId as string;

    if (!customerId) {
      console.log('Customer ID cannot be empty.');

      return;
    }

    removeOrderedCarts = (await inquirer.prompt({
      type: 'list',
      name: 'removeNonActiveCarts',
      message: `If the mechanism will find any carts with the "Ordered" status(that cannot be modified, but can be deleted without a loss of order itself),
        Do you want to delete such carts?`,
      choices: Object.values(RemoveOrderedCarts)
    })).removeNonActiveCarts as RemoveOrderedCarts;

    await anonymizeWholeCustomer((await getCustomer(customerId as string)).body, getRemoveOrderedCartsBoolean(removeOrderedCarts), config.batchSize);
  } else {
    // Anonymization personalized per entity
    const anonymizationConfig = await fetchAnonymizationConfig();

    if (anonymizationConfig.cart.process) {
      removeOrderedCarts = (await inquirer.prompt({
        type: 'list',
        name: 'removeNonActiveCarts',
        message: `If program will find any carts with the "Ordered" status(that cannot be modified, but can be deleted without a loss of order itself),
        Do you want to delete such carts?`,
        choices: Object.values(RemoveOrderedCarts)
      })).removeNonActiveCarts as RemoveOrderedCarts;
    }

    for (const [entity, entityConfig] of Object.entries(anonymizationConfig)) {
      console.log('\n\n');
      console.log(boxen(`Processing entity: ${entity} \n\nThis may take a while...`,
        { borderColor: 'blue', title: 'Anonymizer INFO', padding: 1 })
      );

      if (!entityConfig.process) {
        console.log(`\n\nEntity ${entity} skipped based on the provided config.`);

        continue;
      }

      const entityCount = entityConfig.mode === AnonymizeEntityActMode.All ? await getEntityCount(entity as TypeId) : undefined;

      setupProgressSubscriber(entityCount);

      await anonymizeEntity(entity as TypeId, getRemoveOrderedCartsBoolean(removeOrderedCarts), config.batchSize, entityConfig);
    }
  }

  console.log('\n\nDone');
};

const getRemoveOrderedCartsBoolean = (value: RemoveOrderedCarts) => {
  if (value === RemoveOrderedCarts.No) {
    return false;
  }

  return true;
};

const fetchAnonymizationConfig = async () => {
  const result: Record<Exclude<TypeId, TypeId.Payment>, AnonymizeEntityConfig> = {
    [TypeId.Rewiew]: {
      process: false,
      id: undefined,
      mode: null
    },
    [TypeId.ShoppingList]: {
      process: false,
      id: undefined,
      mode: null
    },
    [TypeId.Order]: {
      process: false,
      id: undefined,
      mode: null
    },
    [TypeId.Cart]: {
      process: false,
      id: undefined,
      mode: null
    },
    [TypeId.Customer]: {
      process: false,
      id: undefined,
      mode: null
    },
  };

  for (const entity of Object.keys(result)) {
    console.log('\n');

    const anonymize = !!(await inquirer.prompt({
      type: 'confirm',
      name: 'process',
      message: `Do you want to anonymize ${entity.toUpperCase()} entities?`,
    })).process;

    result[entity as keyof typeof result].process = anonymize;

    if (anonymize) {
      const anonymizeActMode = (await inquirer.prompt({
        type: 'list',
        name: 'mode',
        message: `How many ${entity.toUpperCase()} entities do you want to anonymize`,
        choices: Object.values(AnonymizeEntityActMode),
        default: AnonymizeEntityActMode.All
      })).mode;

      result[entity as keyof typeof result].mode = anonymizeActMode;

      if (anonymizeActMode !== AnonymizeEntityActMode.All) {
        const anonymizeId = (await inquirer.prompt({
          type: 'input',
          name: 'id',
          message: `Provide ${entity.toUpperCase()} ID`,
        })).id;

        if (!anonymizeId) {
          console.log('ID cannot be empty.');

          throw Error;
        }

        result[entity as keyof typeof result].id = anonymizeId;
      }
    }
  }

  return result;
};

const getEntityCount = async (entity: TypeId) => {
  switch (entity) {
    case TypeId.Cart:
      return getCartsCount();
    case TypeId.Order:
      return getOrdersCount();
    case TypeId.Payment:
      return getPaymentsCount();
    case TypeId.Rewiew:
      return getReviewsCount();
    case TypeId.Customer:
      return getCustomersCount();
    case TypeId.ShoppingList:
      return getShoppingListsCount();
    default:
      undefined;
  }
};
