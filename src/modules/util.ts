import { sortBy } from 'lodash';

export interface TypedItem<T> {
  type: T;
}

export interface CategorizableItem<CT> {
  categoryType: CT;
  sortOrder: number;
}

export interface CategorizableTypedItem<T, CT>
  extends CategorizableItem<CT>,
    TypedItem<T> {}

export interface Category<CT> extends TypedItem<CT> {
  type: CT;
  sortOrder: number;
}

export interface CategorizedItem<C, I> {
  category: C;
  items: I[];
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

const getCategoryFromType = <CT, C extends TypedItem<CT>>(
  type: CT,
  categories: C[]
) => {
  return findItemOfType<CT, C>(type, categories);
};

export const categorizeItems = <
  CT, // The category type
  C extends Category<CT>, // The category
  I extends CategorizableItem<CT>, // The item
  CI extends CategorizedItem<C, I> // The categorized item
>(
  items: I[],
  categories: C[]
): CI[] => {
  let categorizedItems = items.reduce(
    (previousCategorizedItems: CI[], item: I) => {
      const existingCategorizedItem = previousCategorizedItems.find(
        (categorizedItem) => categorizedItem.category.type === item.categoryType
      );

      if (existingCategorizedItem) {
        existingCategorizedItem.items.push(item);
      } else {
        previousCategorizedItems.push({
          items: [item],
          category: getCategoryFromType<CT, C>(item.categoryType, categories),
        } as CI); // TODO: Figure out how remove the 'as'
      }

      return previousCategorizedItems;
    },
    []
  );

  categorizedItems = sortBy<CI>(categorizedItems, (categorizedItem) => {
    return categorizedItem.category.sortOrder;
  });

  categorizedItems.forEach((categorizedItem) => {
    categorizedItem.items = sortBy<I>(categorizedItem.items, (item) => {
      return item.sortOrder;
    });
  });

  return categorizedItems;
};
