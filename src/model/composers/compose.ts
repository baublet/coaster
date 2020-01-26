import {
  ModelFactoryComposerFunction,
  ModelComputedType,
  ModelFactory
} from "model/types";
import { Validator } from "model/validate/validate";
import tooManyComposersError from "model/error/tooManyComposers";

export const maximumComposers: number =
  parseInt(process.env.COMPOSER_MAX, 10) || 32;

export default function composeModel(
  modelName: string,
  composers: ModelFactoryComposerFunction[],
  computedProps: Record<string, ModelComputedType>,
  has: (ModelFactory | ModelFactory[])[],
  validators: Validator[]
) {
  if (!composers) return;
  if (!composers.length) return;
  const allComposers = composers.slice(0);
  for (let i = 0; i < maximumComposers; i++) {
    const newComposers = [];
    const composer = allComposers.shift();
    composer({
      composers: newComposers,
      computedProps,
      has,
      validators
    });
    // If there aren't new composers and we're out of composers
    // to run, we're done! Return.
    if (allComposers.length === 0 && newComposers.length === 0) {
      return;
    }
    if (newComposers.length === 0) {
      continue;
    }
    newComposers.forEach(composer => allComposers.push(composer));
  }
  throw tooManyComposersError(modelName, maximumComposers);
}
