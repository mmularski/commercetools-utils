import { faker } from '@faker-js/faker';
import { Mutable, fallbackCurrency, fallbackLocale } from '../common';
import { getClient } from '../factories';
import { TransactionState, TransactionType, TypeId } from '../models';
import { PaymentDraft } from '@commercetools/platform-sdk';

export const createFakePayment = async (customerId?: string) => {
  const ctClient = await getClient();
  const project = (await ctClient.get().execute()).body;
  const locale = project.languages.at(0) ?? fallbackLocale;
  const currency = project.currencies.at(0) ?? fallbackCurrency;

  const paymentDraft: Mutable<PaymentDraft> = {
    amountPlanned: {
      currencyCode: currency,
      centAmount: Number(faker.random.numeric(6))
    },
    transactions: [{
      amount: {
        currencyCode: currency,
        centAmount: Number(faker.random.numeric(5))
      },
      state: faker.helpers.arrayElement(Object.values(TransactionState)),
      type: faker.helpers.arrayElement(Object.values(TransactionType)),
      interactionId: faker.datatype.uuid(),
      timestamp: (new Date()).toISOString().split('T').at(0)
    }],
    paymentMethodInfo: {
      name: {
        [locale]: faker.lorem.words()
      },
      method: 'fake card',
      paymentInterface: faker.helpers.slugify(faker.lorem.words(5))
    },
    interfaceId: faker.datatype.uuid()
  };

  if (customerId) {
    paymentDraft.customer = {
      typeId: TypeId.Customer,
      id: customerId
    };
  }

  return ctClient.payments().post({
    body: paymentDraft
  }).execute();
};
