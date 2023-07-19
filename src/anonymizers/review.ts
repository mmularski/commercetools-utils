import { getClient } from '../factories';
import { maskSentence, maskString } from '../common';
import { Review, ReviewSetAuthorNameAction, ReviewSetTextAction, ReviewSetTitleAction } from '@commercetools/platform-sdk';
import { HttpStatusCodes, ReviewUpdateActions } from '../models';
import { HttpErrorType } from '@commercetools/sdk-client-v2';
import { getReview } from '../providers';
import pRetry, { AbortError } from 'p-retry';

export const anonymizeReview = async (review: Review) => {
  return pRetry(async () => action(review), {
    factor: 0.5,
    retries: 5,
    onFailedAttempt: (error) => {
      console.log(`Concurrent modification error. Retrying review anonymization request... (Attempt: ${error.attemptNumber})`);
    }
  });
};

const action = async (review: Review) => {
  try {
    const [ctClient, currentReview] = await Promise.all([
      getClient(), getReview(review.id)
    ]);

    return ctClient.reviews().withId({ ID: currentReview.body.id }).post({
      body: {
        actions: [
          ...getReviewAuthorAction(currentReview.body),
          ...getReviewTextAction(currentReview.body),
          ...getReviewTitleAction(currentReview.body)
        ],
        version: currentReview.body.version
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

const getReviewAuthorAction = (review: Review): ReviewSetAuthorNameAction[] => (review.authorName ? [
  {
    action: ReviewUpdateActions.setAuthorName,
    authorName: maskSentence(review.authorName)
  } as ReviewSetAuthorNameAction
] : []);

const getReviewTextAction = (review: Review): ReviewSetTextAction[] => (review.text ? [
  {
    action: ReviewUpdateActions.setText,
    text: maskSentence(review.text)
  } as ReviewSetTextAction
] : []);

const getReviewTitleAction = (review: Review): ReviewSetTitleAction[] => (review.title ? [
  {
    action: ReviewUpdateActions.setTitle,
    title: maskString(review.title)
  } as ReviewSetTitleAction
] : []);
