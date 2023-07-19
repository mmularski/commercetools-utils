import { Address } from '@commercetools/platform-sdk';
import { faker } from '@faker-js/faker';

export const getFakeAddress = (): Address => ({
  id: faker.datatype.uuid(),
  country: faker.address.countryCode(),
  postalCode: faker.address.zipCode(),
  phone: faker.phone.number(),
  mobile: faker.phone.number(),
  streetName: faker.address.street(),
  streetNumber: faker.random.alphaNumeric(3),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  city: faker.address.city(),
  additionalAddressInfo: faker.lorem.words(10),
  additionalStreetInfo: faker.lorem.words(10),
  apartment: faker.random.alphaNumeric(3),
  building: faker.random.alphaNumeric(3),
  company: faker.company.name(),
  department: faker.commerce.department(),
  fax: faker.phone.number(),
  pOBox: faker.random.alphaNumeric(5),
  region: faker.address.state(),
  state: faker.address.state(),
  title: faker.lorem.word(),
  salutation: faker.lorem.word(),
});
