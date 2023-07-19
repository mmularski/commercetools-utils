import inquirer from 'inquirer';
import pMap from 'p-map';
import { MAX_CONCURRENCY, setupProgressSubscriber } from '../common';
import { createFakeEntities } from '../services';

export const fill = async () => {
  try {
    const customersCount = (await inquirer.prompt({
      type: 'number',
      name: 'customersCount',
      message: 'How many customers you would like to create?'
    })).customersCount as number;

    const countAbs = Math.abs(customersCount);

    setupProgressSubscriber(countAbs);

    await pMap(Array(countAbs).keys(), (async () => {
      await createFakeEntities();
    }), { stopOnError: false, concurrency: MAX_CONCURRENCY });

    console.log('\n\nDone');
  } catch (error) {
    console.log(error);
  }
};

