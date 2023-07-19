import { Customer } from '@commercetools/platform-sdk';
import { getClient } from '../factories';

export const destroyCustomer = async (customer: Customer) => {
  const ctClient = await getClient();

  return ctClient.customers()
    .withId({ ID: customer.id })
    .delete({
      queryArgs: {
        version: customer.version,
        dataErasure: true
      }
    })
    .execute();
};
