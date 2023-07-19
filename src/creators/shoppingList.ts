import { faker } from '@faker-js/faker';
import { getClient } from '../factories';
import { fallbackLocale } from '../common';
import { TypeId } from '../models';

export const createFakeShoppingList = async (customerId: string) => {
  const ctClient = await getClient();
  const project = (await ctClient.get().execute()).body;
  const locale = project.languages.at(0) ?? fallbackLocale;

  return ctClient.shoppingLists().post({
    body: {
      name: {
        [locale]: faker.lorem.words(10)
      },
      customer: {
        typeId: TypeId.Customer,
        id: customerId
      },
      deleteDaysAfterLastModification: 3,
      description: {
        [locale]: faker.lorem.words(25)
      },
      slug: {
        [locale]: faker.helpers.slugify(faker.lorem.words())
      },
      textLineItems: faker.datatype.array(Number(faker.random.numeric())).map(() => getTextLineItem(locale))
    }
  }).execute();
};

const getTextLineItem = (locale: string) => ({
  name: {
    [locale]: faker.lorem.words()
  },
  description: {
    [locale]: faker.lorem.words(25)
  },
  quantity: Number(faker.random.numeric()),
  addedAt: (new Date()).toISOString().split('T').at(0)
});
