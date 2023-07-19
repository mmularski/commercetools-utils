import { getClient } from '../factories';
import { Payment } from '@commercetools/platform-sdk';

export const destroyPayment = async (payment: Payment) => {
  const ctClient = await getClient();

  return ctClient.payments()
    .withId({ ID: payment.id })
    .delete({
      queryArgs: {
        version: payment.version
      }
    })
    .execute();
};
