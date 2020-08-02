import { findItemOfType, TypedItem } from './util';

enum TestType {
  FOO = 'foo',
  BAR = 'bar',
  BAZ = 'baz',
}

interface TestItem extends TypedItem<TestType> {}

const testItems: TestItem[] = [{ type: TestType.FOO }, { type: TestType.BAR }];

describe('The util module', () => {
  describe('findItemOfType() function', () => {
    it('returns the found item if it exists', () => {
      expect(
        findItemOfType<TestType, TestItem>(TestType.FOO, testItems)
      ).toEqual({ type: TestType.FOO });
    });

    it('throws an error if the item cannot be found', () => {
      expect(() => {
        findItemOfType<TestType, TestItem>(TestType.BAZ, testItems);
      }).toThrow(new Error('No definition found for type baz'));
    });
  });
});
