import { placeholderFn } from './database.utils';

describe('placeholderFn', () => {

  it('should place string, int, float, boolean, jsonb', () => {
    const expectedValue = "($1::TEXT, $2, $3, $4::JSONB, $5::NUMERIC)"
    interface interfaceObject1 { x: number }
    interface interfaceObject {
      a: string;
      b: number | undefined;
      c: number | null;
      d: interfaceObject1;
      e: number;
    }
    let valuesObjectArray = [
      { a: 'string', b: undefined, c: null, d: { x: 1 }, e: 2} ,
    ];
    let receivedValue = placeholderFn<interfaceObject>(
      1, valuesObjectArray
    );
    expect(receivedValue).toStrictEqual(expectedValue);
  });
});
