export default function tooManyComposersError(
  modelName: string,
  maxComposers: number
): Error {
  return new Error(
    `${modelName} has too many composers. The maximum is ${maxComposers}. This may be caused by other composers adding additional composers. We put this guard in place to prevent infinite loops, where composers add themselves and crash our application. If you want to boost this number, you can set the MODEL_COMPOSER_MAX environment variable to a higher number.`
  );
}
