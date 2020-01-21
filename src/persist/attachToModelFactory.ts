import { ModelFactoryWithPersist } from "model/createModel";
import { PersistConnection } from "./connect";
import { queryFactory } from "./query";

export function attachPersistToModelFactory<T, C>(
  modelFactory: ModelFactoryWithPersist<T, C>,
  persist: PersistConnection
): void {
  modelFactory.query = queryFactory<T, C>(persist, modelFactory);
}
