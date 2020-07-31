export interface TypedItem<T> {
  type: T;
}

export const findItemOfType = <T, I extends TypedItem<T>>(
  type: T,
  items: I[]
) => {
  const foundItem = items.find((item) => item.type === type);

  if (foundItem) {
    return foundItem;
  }

  throw new Error(`No definition found for type ${type}`);
};
