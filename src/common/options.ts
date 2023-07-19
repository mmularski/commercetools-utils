export enum RuntimeMode {
  erase = 'erase',
  anonymize = 'anonymize',
  fill = 'fill'
}

export enum EraseActMode {
  All = 'All(with guests)',
  'ID' = 'One Customer',
}

export enum AnonymizeActMode {
  PerEntity = 'Choose per each entity separately',
  OneCustomer = 'One customer with all dependant data',
}

export enum AnonymizeEntityActMode {
  All = 'All',
  'FromID' = 'Starting from a specific ID(sorted in ASC order)',
  'ID' = 'One Entity'
}

export enum RemoveOrderedCarts {
  Yes = 'Yes',
  No = 'No'
}

export type AnonymizeEntityConfig = { process: boolean, id: undefined | string, mode: null | AnonymizeEntityActMode };
