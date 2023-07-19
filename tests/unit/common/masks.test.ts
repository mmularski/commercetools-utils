import { LocalizedString } from '@commercetools/platform-sdk';
import { defaultMask, getRandomMask, maskEmail, maskLocalizedString, maskSentence, maskString } from '../../../src/common';

describe('Unit: Data masking', () => {
  it('Should return random mask with the correct mask character and maximum mask length', () => {
    const maskChar = 'O';
    const maskLength = 15;

    expect(getRandomMask(maskLength, maskChar)
      .match(`^.*${maskChar}{1,${maskLength}}.*$`)?.length).toBeGreaterThanOrEqual(1);
  });

  it('Should successfully mask string to return a different nonmeaningful string', () => {
    const value = 'ThisIsSomeMeaningfulString';

    const anonymizedVal = maskString(value);

    expect(anonymizedVal).not.toEqual(value);
    expect(anonymizedVal).not.toMatch(value);
    expect(anonymizedVal).not.toContain(value);
  });

  it(`Should successfully mask string to return a different nonmeaningful string
with the specified max length of the mask`, () => {
    const maskLength = 10;
    const value = 'ThisIsSomeMeaningfulString';
    const anonymizedVal = maskString(value, maskLength);

    expect(anonymizedVal.match(`^.*${defaultMask}{1,${maskLength}}.*$`)?.length).toBeGreaterThanOrEqual(1);
  });

  it('Should successfully mask 2 same strings to return a different nonmeaningful strings', () => {
    const value = 'ThisIsSomeMeaningfulString';
    const maskMaxLength = 5;

    const anonymizedVal1 = maskString(value, maskMaxLength);
    const anonymizedVal2 = maskString(value, maskMaxLength);

    expect(anonymizedVal1).not.toEqual(anonymizedVal2);
  });

  it('Should successfully mask a localized string to return a different nonmeaningful localized string', () => {
    const value: LocalizedString = {
      'pl-PL': 'To jest jakiś tekst',
      'de-DE': 'Das ist ein Text',
      'en-US': 'This is some text',
      'ja-JP': 'これは何らかのテキストです'
    };

    const anonymizedVal = maskLocalizedString(value);

    for (const key of Object.keys(value)) {
      expect(anonymizedVal[key]).not.toEqual(value[key]);
    }
  });

  it(`Should successfully mask an email address to return a different nonmeaningful one 
  with the correct email structure`, () => {
    const email = 'this.is.an.email@domain.com';

    const anonymizedEmail = maskEmail(email);

    expect(anonymizedEmail).not.toEqual(email);
    expect(anonymizedEmail).not.toMatch(email);
    expect(anonymizedEmail).not.toContain(email);

    expect(anonymizedEmail.match('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$')?.length).toBeGreaterThanOrEqual(1);
  });

  it('Should successfully mask a whole sentence to return a different nonmeaningful sentence with each word masked', () => {
    const value = `Pancakes Recipe 
    STEP 1
       Put 100g plain flour, 2 large eggs, 300ml milk, 1 tbsp sunflower or vegetable oil and a pinch of salt into a bowl or large jug, then whisk to a smooth batter.
    STEP 2
       Set aside for 30 mins to rest if you have time, or start cooking straight away.
    STEP 3
       Set a medium frying pan or crêpe pan over a medium heat and carefully wipe it with some oiled kitchen paper.
    STEP 4
       When hot, cook your pancakes for 1 min on each side until golden, keeping them warm in a low oven as you go.`;

    const anonymizedVal = maskSentence(value);
    const anonymizedValWords = anonymizedVal.split(' ');

    for (const [index, word] of (value.match(/\b(\w+)\b/g) ?? []).entries()) {
      expect(anonymizedValWords.at(index)).not.toEqual(word);
    }

    expect(anonymizedVal).not.toEqual(value);
    expect(anonymizedVal).not.toMatch(value);
    expect(anonymizedVal).not.toContain(value);
  });
});
