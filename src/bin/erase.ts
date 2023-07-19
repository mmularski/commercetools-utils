import { Customer } from '@commercetools/platform-sdk';
import inquirer from 'inquirer';
import pMap from 'p-map';
import { Config, EraseActMode, MAX_CONCURRENCY, setupProgressSubscriber } from '../common';
import { getCustomer, getCustomers, getCustomersCount } from '../providers';
import { destroyCustomer, destroyGuests } from '../services';

export const erase = async (config: Config) => {
  try {
    let customerId: string | null = null;

    const actMode = (await inquirer.prompt({
      type: 'list',
      name: 'actMode',
      message: 'How many customers do you want to erase?',
      choices: Object.values(EraseActMode),
      default: EraseActMode.ID
    })).actMode as EraseActMode;

    if (actMode === EraseActMode.ID) {
      customerId = (await (inquirer.prompt({
        type: 'input',
        name: 'customerId',
        message: 'Provide the customer ID you want to erase'
      }))).customerId as string;

      if (!customerId) {
        console.log('Customer ID cannot be empty.');

        return;
      }
    }

    if (actMode === EraseActMode.ID) {
      setupProgressSubscriber(1);

      await destroyCustomer((await getCustomer(customerId as string)).body, config.batchSize);
    } else {
      const customersCount = await getCustomersCount();

      setupProgressSubscriber(customersCount);

      let isLastBatch = false;
      let lastId = undefined;

      while (!isLastBatch) {
        const customers: Customer[] = await getCustomers(config.batchSize, lastId) ?? [];
        lastId = customers.at(-1)?.id;

        if (customers.length < config.batchSize) {
          isLastBatch = true;
        }

        await pMap(customers, (async (customer) => {
          await destroyCustomer(customer, config.batchSize);
        }), { concurrency: MAX_CONCURRENCY, stopOnError: false });
      }

      await destroyGuests(config.batchSize);
    }

    console.log('\n\nDone');
  } catch (error) {
    console.log(error);
  }
};
