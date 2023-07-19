import { faker } from '@faker-js/faker';
import { getClient } from '../factories';
import { maskEmail, maskString } from '../common';
import { anonymizeAddress } from '../anonymizers';
import { Customer, CustomerChangeAddressAction, CustomerSetCompanyNameAction, CustomerSetDateOfBirthAction, CustomerSetExternalIdAction, CustomerSetFirstNameAction, CustomerSetLastNameAction, CustomerSetMiddleNameAction, CustomerSetTitleAction, CustomerSetVatIdAction } from '@commercetools/platform-sdk';
import { CustomerUpdateActions, HttpStatusCodes } from '../models';
import { HttpErrorType } from '@commercetools/sdk-client-v2';
import pRetry, { AbortError } from 'p-retry';
import { getCustomer } from '../providers';

export const anonymizeCustomer = async (customer: Customer) => {
  return pRetry(async () => action(customer), {
    factor: 0.5,
    retries: 5,
    onFailedAttempt: (error) => {
      console.log(`Concurrent modification error. Retrying customer anonymization request... (Attempt: ${error.attemptNumber})`);
    }
  });
};

const action = async (customer: Customer) => {
  try {
    const [ctClient, currentCustomer] = await Promise.all([
      getClient(), getCustomer(customer.id)
    ]);

    return ctClient.customers().withId({ ID: currentCustomer.body.id }).post({
      body: {
        actions: [
          {
            action: CustomerUpdateActions.changeEmail,
            email: maskEmail(currentCustomer.body.email)
          },
          ...getCustomerExternalIdAction(currentCustomer.body),
          ...getCustomerTitleAction(currentCustomer.body),
          ...getCustomerFirstNameAction(currentCustomer.body),
          ...getCustomerLastNameAction(currentCustomer.body),
          ...getCustomerCompanyNameAction(currentCustomer.body),
          ...getCustomerDOBAction(currentCustomer.body),
          ...getCustomerMiddleNameAction(currentCustomer.body),
          ...getCustomerVatIdAction(currentCustomer.body),
          ...getCustomerChangeAddressActions(currentCustomer.body)
        ],
        version: currentCustomer.body.version
      }
    }).execute();
  } catch (error) {
    const err = error as unknown as HttpErrorType;

    if (err.statusCode !== HttpStatusCodes.Conflict) {
      console.log(err);
      console.log('Request body ' + JSON.stringify(err.originalRequest.body, null, 4));
      console.log(JSON.stringify(err.body?.errors, null, 4));

      throw new AbortError(err.message);
    }

    console.log(err.message);
  }
};

const getCustomerExternalIdAction = (customer: Customer): CustomerSetExternalIdAction[] => (customer.externalId ? [
  {
    action: CustomerUpdateActions.setExternalId,
    externalId: maskString(customer.externalId, 23)
  } as CustomerSetExternalIdAction
] : []);

const getCustomerTitleAction = (customer: Customer): CustomerSetTitleAction[] => (customer.title ? [
  {
    action: CustomerUpdateActions.setTitle,
    title: maskString(customer.title)
  } as CustomerSetTitleAction
] : []);

const getCustomerFirstNameAction = (customer: Customer): CustomerSetFirstNameAction[] => (customer.firstName ? [
  {
    action: CustomerUpdateActions.setFirstName,
    firstName: maskString(customer.firstName)
  } as CustomerSetFirstNameAction
] : []);

const getCustomerMiddleNameAction = (customer: Customer): CustomerSetMiddleNameAction[] => (customer.middleName ? [
  {
    action: CustomerUpdateActions.setMiddleName,
    middleName: maskString(customer.middleName)
  } as CustomerSetMiddleNameAction
] : []);

const getCustomerLastNameAction = (customer: Customer): CustomerSetLastNameAction[] => (customer.lastName ? [
  {
    action: CustomerUpdateActions.setLastName,
    lastName: maskString(customer.lastName)
  } as CustomerSetLastNameAction
] : []);

const getCustomerCompanyNameAction = (customer: Customer): CustomerSetCompanyNameAction[] => (customer.companyName ? [
  {
    action: CustomerUpdateActions.setCompanyName,
    companyName: maskString(customer.companyName)
  } as CustomerSetCompanyNameAction
] : []);

const getCustomerDOBAction = (customer: Customer): CustomerSetDateOfBirthAction[] => (customer.dateOfBirth ? [
  {
    action: CustomerUpdateActions.setDateOfBirth,
    dateOfBirth: faker.date.birthdate().toISOString().split('T').at(0)
  } as CustomerSetDateOfBirthAction
] : []);

const getCustomerVatIdAction = (customer: Customer): CustomerSetVatIdAction[] => (customer.vatId ? [
  {
    action: CustomerUpdateActions.setVatId,
    vatId: maskString(customer.vatId)
  } as CustomerSetVatIdAction
] : []);

const getCustomerChangeAddressActions = (customer: Customer): CustomerChangeAddressAction[] => (customer.addresses ?
  customer.addresses.map((address): CustomerChangeAddressAction => (
    {
      action: CustomerUpdateActions.changeAddress,
      addressId: address.id,
      address: anonymizeAddress(address)
    }
  )) : []);
