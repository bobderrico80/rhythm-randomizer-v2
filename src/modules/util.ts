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

export const buildBemClassName = (block: string) => (element?: string) => (
  modifier?: string
) => {
  let className = block;

  if (element) {
    className = `${className}__${element}`;
  }

  if (modifier) {
    className = `${className}--${modifier}`;
  }

  return className;
};

export const tryOrNull = <T>(
  toTry: () => T,
  catchSideEffect?: (error: any) => void
): T | null => {
  try {
    return toTry();
  } catch (error) {
    if (catchSideEffect) {
      catchSideEffect(error);
    }

    return null;
  }
};
