import { ScoreElementDefinition } from './score';

export const findDefinition = <T, D extends ScoreElementDefinition<T>>(
  type: T,
  definitions: D[]
) => {
  const foundDefinition = definitions.find(
    (definition) => definition.type === type
  );

  if (foundDefinition) {
    return foundDefinition;
  }

  throw new Error(`No definition found for type ${type}`);
};
