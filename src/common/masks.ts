import { LocalizedString } from '@commercetools/platform-sdk';
import { faker } from '@faker-js/faker';

export const defaultMask = 'X';

export const getRandomMask = (maxLength?: number, maskCharacter = defaultMask) => faker.datatype.array(Number(faker.datatype.number({ max: maxLength ? maxLength : 10, min: 1 })))
  .map(() => maskCharacter).join('');

export const maskEmail = (value: string) => {
  let result = '';

  const personalPart = value.split('@').at(0) ?? '';

  result += String(personalPart.at(0));
  result += String(getRandomMask());
  result += String(personalPart.at(-1));
  result += '@';
  result += String(faker.random.alpha({ count: 5 }));
  result += '.anon';

  return result;
};

export const maskString = (value: string, maskMaxLength?: number) => {
  let result = '';

  if (!value) {
    return result;
  }

  result += String(value.at(0) ?? '');
  result += String(getRandomMask(maskMaxLength));
  result += String(faker.random.alphaNumeric(5));
  result += String(value.at(-1) ?? '');

  return result;
};

export const maskSentence = (value: string, maskMaxLength?: number) => {
  const words = (value.match(/\b(\w+)\b/g) ?? faker.lorem.words().split(' '));

  return words.map((word) => maskString(word, maskMaxLength)).join(' ');
};

export const maskLocalizedString = (value: LocalizedString, maskLength?: number) => {
  const result: LocalizedString = {};

  Object.keys(value).map((key) => result[key] = maskSentence(value[key], maskLength));

  return result;
};
