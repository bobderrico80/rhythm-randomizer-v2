import {
  findItemOfType,
  buildBemClassName,
  tryOrNull,
  Category,
  CategorizableTypedItem,
  CategorizedItem,
  categorizeItems,
  duplicate,
} from './util';

enum TestType {
  FOO = 'foo',
  FAA = 'faa',
  FEE = 'fee',
  BAR = 'bar',
  BAZ = 'baz',
  BAY = 'bay',
}

enum TestCategoryType {
  FS = 'Fs',
  BS = 'Bs',
}

interface TestItem extends CategorizableTypedItem<TestType, TestCategoryType> {}
interface TestCategory extends Category<TestCategoryType> {}
interface CategorizedTestItem extends CategorizedItem<TestCategory, TestItem> {}

const testCategories: TestCategory[] = [
  { type: TestCategoryType.FS, sortOrder: 0 },
  { type: TestCategoryType.BS, sortOrder: 1 },
];

const testItems: TestItem[] = [
  { type: TestType.FOO, categoryType: TestCategoryType.FS, sortOrder: 0 },
  { type: TestType.FAA, categoryType: TestCategoryType.FS, sortOrder: 1 },
  { type: TestType.FEE, categoryType: TestCategoryType.FS, sortOrder: 2 },
  { type: TestType.BAR, categoryType: TestCategoryType.BS, sortOrder: 3 },
  { type: TestType.BAY, categoryType: TestCategoryType.BS, sortOrder: 4 },
];

describe('The util module', () => {
  describe('findItemOfType() function', () => {
    it('returns the found item if it exists', () => {
      expect(
        findItemOfType<TestType, TestItem>(TestType.FOO, testItems)
      ).toMatchObject({ type: TestType.FOO });
    });

    it('throws an error if the item cannot be found', () => {
      expect(() => {
        findItemOfType<TestType, TestItem>(TestType.BAZ, testItems);
      }).toThrow(new Error('No definition found for type baz'));
    });
  });

  describe('buildBemClassName', () => {
    it('handles just the "block" part of the class name', () => {
      expect(buildBemClassName('c-block')()()).toEqual('c-block');
    });

    it('handles an optional "element" part of the class name', () => {
      expect(buildBemClassName('c-block')('element')()).toEqual(
        'c-block__element'
      );
    });

    it('handles an optional "modifier" part of the class name', () => {
      expect(buildBemClassName('c-block')('element')('modifier')).toEqual(
        'c-block__element--modifier'
      );
    });

    it('handles a "modifier"  on the "block" part of the class name', () => {
      expect(buildBemClassName('c-block')()('modifier')).toEqual(
        'c-block--modifier'
      );
    });
  });

  describe('tryOrNull() function', () => {
    it('returns the expected value if the toTry() callback does not throw', () => {
      expect(tryOrNull<string>(() => 'foobar')).toEqual('foobar');
    });

    it('can be wrapped to handle taking parameters', () => {
      const wrapped = (string: string) => {
        return tryOrNull<string>(() => string);
      };

      expect(wrapped('foobar')).toEqual('foobar');
    });

    it('returns null if the toTry() callback throws', () => {
      expect(
        tryOrNull<string>(() => {
          throw new Error('foo');
        })
      ).toEqual(null);
    });

    it('calls the side effect function when handling the error', () => {
      const sideEffectFn = jest.fn();

      tryOrNull<string>(() => {
        throw new Error('foo');
      }, sideEffectFn);

      expect(sideEffectFn).toHaveBeenCalledWith(new Error('foo'));
    });
  });

  describe('categorizeItems() function', () => {
    describe('with items in the same category', () => {
      it('puts same-category note groups into the same categorized note group object', () => {
        expect(
          categorizeItems<
            TestCategoryType,
            TestCategory,
            TestItem,
            CategorizedTestItem
          >(
            [
              {
                type: TestType.FOO,
                categoryType: TestCategoryType.FS,
                sortOrder: 0,
              },
              {
                type: TestType.FEE,
                categoryType: TestCategoryType.FS,
                sortOrder: 2,
              },
              {
                type: TestType.FAA,
                categoryType: TestCategoryType.FS,
                sortOrder: 1,
              },
            ],
            testCategories
          )
        ).toEqual([
          {
            category: {
              type: TestCategoryType.FS,
              sortOrder: 0,
            },
            items: [
              {
                type: TestType.FOO,
                categoryType: TestCategoryType.FS,
                sortOrder: 0,
              },
              {
                type: TestType.FAA,
                categoryType: TestCategoryType.FS,
                sortOrder: 1,
              },
              {
                type: TestType.FEE,
                categoryType: TestCategoryType.FS,
                sortOrder: 2,
              },
            ],
          },
        ]);
      });
    });

    describe('with note groups in different categories', () => {
      it('puts different-category note groups into the separate categorized note group objects, with categories and note groups sorted by sortOrder/index', () => {
        expect(
          categorizeItems<
            TestCategoryType,
            TestCategory,
            TestItem,
            CategorizedTestItem
          >(
            [
              {
                type: TestType.FOO,
                categoryType: TestCategoryType.FS,
                sortOrder: 0,
              },
              {
                type: TestType.FEE,
                categoryType: TestCategoryType.FS,
                sortOrder: 2,
              },
              {
                type: TestType.BAR,
                categoryType: TestCategoryType.BS,
                sortOrder: 3,
              },
              {
                type: TestType.BAY,
                categoryType: TestCategoryType.BS,
                sortOrder: 4,
              },
              {
                type: TestType.FAA,
                categoryType: TestCategoryType.FS,
                sortOrder: 1,
              },
            ],
            testCategories
          )
        ).toEqual([
          {
            category: {
              type: TestCategoryType.FS,
              sortOrder: 0,
            },
            items: [
              {
                type: TestType.FOO,
                categoryType: TestCategoryType.FS,
                sortOrder: 0,
              },
              {
                type: TestType.FAA,
                categoryType: TestCategoryType.FS,
                sortOrder: 1,
              },
              {
                type: TestType.FEE,
                categoryType: TestCategoryType.FS,
                sortOrder: 2,
              },
            ],
          },
          {
            category: {
              type: TestCategoryType.BS,
              sortOrder: 1,
            },
            items: [
              {
                type: TestType.BAR,
                categoryType: TestCategoryType.BS,
                sortOrder: 3,
              },
              {
                type: TestType.BAY,
                categoryType: TestCategoryType.BS,
                sortOrder: 4,
              },
            ],
          },
        ]);
      });
    });
  });

  describe('duplicate() function', () => {
    it('returns an array containing the expected count of duplicated items', () => {
      expect(duplicate('foo', 3)).toEqual(['foo', 'foo', 'foo']);
    });

    it('throws a RangeError if timesToDuplicate is less than 1', () => {
      expect(() => {
        duplicate('foo', 0);
      }).toThrow(RangeError);
    });
  });
});
