import {
  findItemOfType,
  TypedItem,
  buildBemClassName,
  tryOrNull,
} from './util';

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
});
