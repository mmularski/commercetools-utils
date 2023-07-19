import { CustomLineItemDraft } from '@commercetools/platform-sdk';
import { faker } from '@faker-js/faker';
import { fallbackCurrency, fallbackLocale } from '../common';
import { getClient } from '../factories';
import { getCustomer } from '../providers';
import { Mode } from '../models';

export const createFakeCart = async (customerId?: string) => {
  const ctClient = await getClient();

  const [project, customer] = await Promise.all([
    ctClient.get().execute(),
    customerId ? getCustomer(customerId) : null
  ]);

  const currency = project.body.currencies.at(0) ?? fallbackCurrency;
  const locale = project.body.languages.at(0) ?? fallbackLocale;

  return ctClient.carts().post({
    body: {
      taxMode: Mode.External,
      currency,
      customerEmail: customer?.body?.email,
      customLineItems: [
        ...faker.datatype.array(Number(faker.random.numeric())).map(() => getCustomlineItem(currency, locale))
      ],
      customerId
    }
  }).execute();
};

const getCustomlineItem = (currency: string, locale: string): CustomLineItemDraft => {
  const name = faker.commerce.productName();

  return {
    money: {
      currencyCode: currency,
      centAmount: Number(faker.random.numeric(5))
    },
    quantity: Number(faker.random.numeric()),
    name: {
      [locale]: name
    },
    priceMode: Mode.External,
    slug: faker.helpers.slugify(`${name} ${faker.lorem.words(5)}`),
    externalTaxRate: {
      name: `tax-${faker.helpers.slugify(faker.lorem.words(5))}`,
      country: faker.address.countryCode(),
      amount: 0,
      includedInPrice: true
    }
  };
};
