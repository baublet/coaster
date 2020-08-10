import didYouMean from "didyoumean";

import { GeneratedNames } from "./generateNames";

interface EntityLikeObject {
  names: GeneratedNames;
}

export function entityNotFoundError(
  entityName: string,
  entities: EntityLikeObject[],
  message: string
): string {
  const entityList = entities.map((entity) => ({ id: entity.names.canonical }));
  const suggestion = didYouMean(entityName, entityList);

  throw new Error(
    `${message} Searched for: ${entityName}. ${
      suggestion
        ? `Did you mean ${suggestion}`
        : `No partial matches. Known entities: ${entities.join(", ")}`
    }`
  );
}
