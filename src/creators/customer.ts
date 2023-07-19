import { faker } from '@faker-js/faker';
import { getClient } from '../factories';
import { Address } from '@commercetools/platform-sdk';
import { getFakeAddress } from './address';

export const createFakeCustomer = async () => {
  const ctClient = await getClient();

  return ctClient.customers().post({
    body: {
      externalId: faker.random.alphaNumeric(25),
      customerNumber: faker.random.alphaNumeric(30),
      email: faker.internet.email(faker.name.firstName(), faker.name.lastName(), undefined, { allowSpecialCharacters: true }),
      title: faker.lorem.word(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: 'p@ssw0rd',
      addresses: generateAddresses(Number(faker.random.numeric(1, { allowLeadingZeros: true }))),
      companyName: faker.company.name(),
      dateOfBirth: faker.date.birthdate().toISOString().split('T').at(0),
      middleName: faker.name.firstName(),
      vatId: String(faker.datatype.number({ min: 1, max: 999999999 }))
    }
  }).execute();
};


const generateAddresses = (count: number) => {
  const result: Address[] = [];

  for (let index = 0; index < count; index++) {
    result.push(getFakeAddress());
  }

  return result;
};
