export interface CtApiCredentials {
  baseUri: string,
  authUri: string,
  projectKey: string,
  clientId: string,
  clientSecret: string,
  scopes: string[]
}

export enum TypeId {
  Customer = 'customer',
  Cart = 'cart',
  Payment = 'payment',
  Order = 'order',
  Rewiew = 'review',
  ShoppingList = 'shoppingList',
}

export enum CartState {
  Active = 'Active',
  Ordered = 'Ordered'
};

export enum CartUpdateActions {
  setCustomerEmail = 'setCustomerEmail',
  setBillingAddress = 'setBillingAddress',
  setShippingAddress = 'setShippingAddress',
  updateItemShippingAddress = 'updateItemShippingAddress',
  addPayment = 'addPayment'
}

export enum CustomerUpdateActions {
  changeEmail = 'changeEmail',
  changeAddress = 'changeAddress',
  setTitle = 'setTitle',
  setFirstName = 'setFirstName',
  setMiddleName = 'setMiddleName',
  setLastName = 'setLastName',
  setCompanyName = 'setCompanyName',
  setDateOfBirth = 'setDateOfBirth',
  setVatId = 'setVatId',
  setExternalId = 'setExternalId'
}

export enum OrderUpdateActions {
  setBillingAddress = 'setBillingAddress',
  setShippingAddress = 'setShippingAddress',
  setCustomerEmail = 'setCustomerEmail',
  setDeliveryAddress = 'setDeliveryAddress',
  updateItemShippingAddress = 'updateItemShippingAddress'
}

export enum ReviewUpdateActions {
  setAuthorName = 'setAuthorName',
  setText = 'setText',
  setTitle = 'setTitle'
}

export enum ShoppingListUpdateActions {
  changeName = 'changeName',
  changeTextLineItemName = 'changeTextLineItemName',
  setDescription = 'setDescription',
  setSlug = 'setSlug',
  setTextLineItemDescription = 'setTextLineItemDescription'
}

export enum PaymentUpdateActions { }

export enum Mode {
  External = 'External'
};

export enum OrderState {
  Cancelled = 'Cancelled',
  Complete = 'Complete',
  Confirmed = 'Confirmed',
  Open = 'Open'
}

export enum PaymentState {
  BalanceDue = 'BalanceDue',
  CreditOwed = 'CreditOwed',
  Failed = 'Failed',
  Paid = 'Paid',
  Pending = 'Pending'
};

export enum ShipmentState {
  Backorder = 'Backorder',
  Delayed = 'Delayed',
  Delivered = 'Delivered',
  Partial = 'Partial',
  Pending = 'Pending',
  Ready = 'Ready',
  Shipped = 'Shipped'
};

export enum TransactionState {
  Failure = 'Failure',
  Initial = 'Initial',
  Pending = 'Pending',
  Success = 'Success'
};

export enum TransactionType {
  Authorization = 'Authorization',
  CancelAuthorization = 'CancelAuthorization',
  Charge = 'Charge',
  Chargeback = 'Chargeback',
  Refund = 'Refund'
};

