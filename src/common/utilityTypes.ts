/**
 * Changes in a <Type> readonly values to mutable ones
 * Usefull with Commercetools types where multiple properties are marked as readonly
 */
export type Mutable<Type> = {
  -readonly [Key in keyof Type]: Type[Key];
};
