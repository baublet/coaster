export default function noPersistAdapterError(modelName: string): Error {
  return new Error(
    `You tried to call a model's persist functionality on the model ${modelName}, which was never passed a persist layer. Fix this error by passing "persistsWith" as part of your model declaration.`
  );
}
