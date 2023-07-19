import { Address } from '@commercetools/platform-sdk';
import { maskString, maskEmail, maskSentence } from '../common';

export const anonymizeAddress = (address: Address): Address => ({
  country: address.country,
  key: address.key,
  postalCode: address.postalCode ? maskString(address.postalCode) : undefined,
  phone: address.phone ? maskString(address.phone) : undefined,
  mobile: address.mobile ? maskString(address.mobile) : undefined,
  streetName: address.streetName ? maskString(address.streetName) : undefined,
  streetNumber: address.streetNumber ? maskString(address.streetNumber, 3) : undefined,
  firstName: address.firstName ? maskString(address.firstName) : undefined,
  lastName: address.lastName ? maskString(address.lastName) : undefined,
  email: address.email ? maskEmail(address.email) : undefined,
  city: address.city ? maskString(address.city) : undefined,
  additionalAddressInfo: address.additionalAddressInfo ? maskSentence(address.additionalAddressInfo) : undefined,
  additionalStreetInfo: address.additionalStreetInfo ? maskSentence(address.additionalStreetInfo) : undefined,
  apartment: address.apartment ? maskString(address.apartment) : undefined,
  building: address.building ? maskString(address.building) : undefined,
  company: address.company ? maskString(address.company) : undefined,
  department: address.department ? maskString(address.department) : undefined,
  fax: address.fax ? maskString(address.fax) : undefined,
  pOBox: address.pOBox ? maskString(address.pOBox) : undefined,
  region: address.region ? maskString(address.region) : undefined,
  state: address.state ? maskString(address.state) : undefined,
  salutation: address.salutation ? maskString(address.salutation) : undefined,
  title: address.title ? maskString(address.title) : undefined
});
