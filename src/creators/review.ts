import { faker } from '@faker-js/faker';
import { getClient } from '../factories';
import { fallbackLocale } from '../common';
import { TypeId } from '../models';

export const createFakeReview = async (customerId: string) => {
  const ctClient = await getClient();
  const project = (await ctClient.get().execute()).body;
  const locale = project.languages.at(0) ?? fallbackLocale;

  return ctClient.reviews().post({
    body: {
      authorName: faker.name.fullName(),
      customer: {
        typeId: TypeId.Customer,
        id: customerId
      },
      rating: faker.datatype.number({ min: 1, max: 100 }),
      title: faker.lorem.words(),
      text: faker.lorem.words(20),
      locale
    }
  }).execute();
};
