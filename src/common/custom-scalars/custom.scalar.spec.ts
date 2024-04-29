import { Kind } from 'graphql';
import { NumberRangeScalarFactory, ScalarTypeEnum } from './custom.scalar';

describe('NumberRangeScalarFactory', () => {
  const scalarConfig = {
    name: 'CustomScalar',
    description: 'Custom scalar with constraints',
    min: 0,
    max: 100,
    type: ScalarTypeEnum.INT,
  };

  const customScalar = new (NumberRangeScalarFactory(scalarConfig))();

  it('should be defined', () => {
    expect(customScalar).toBeDefined();
  });

  describe('serialize', () => {
    it('should serialize valid value', () => {
      expect(customScalar.serialize(10)).toBe(10);
    });

    it('should serialize valid float value', () => {
        expect(customScalar.serialize(10.5)).toBe(11);
        expect(customScalar.serialize(10.1)).toBe(10);
      });

    it('should throw error for invalid value', () => {
      expect(() => customScalar.serialize('abc')).toThrow();
      expect(() => customScalar.serialize(-1)).toThrow();
      expect(() => customScalar.serialize(101)).toThrow();
    });
  });

  describe('parseValue', () => {
    it('should parse valid value', () => {
      expect(customScalar.parseValue('10')).toBe(10);
    });

    it('should serialize valid float value', () => {
        expect(customScalar.parseValue(10.5)).toBe(11);
        expect(customScalar.parseValue(10.1)).toBe(10);
      });

    it('should throw error for invalid value', () => {
      expect(() => customScalar.parseValue('abc')).toThrow();
      expect(() => customScalar.parseValue('-1')).toThrow();
      expect(() => customScalar.parseValue('101')).toThrow();
    });
  });

  describe('parseLiteral', () => {
    it('should parse valid literal', () => {
      expect(customScalar.parseLiteral({ kind: Kind.INT, value: '10' })).toBe(10);
    });

    it('should parse valid float literal', () => {
        expect(customScalar.parseLiteral({ kind: Kind.FLOAT, value: '10.5' })).toBe(11);
      });

    it('should throw error for invalid literal', () => {
      expect(() => customScalar.parseLiteral({ kind: Kind.INT, value: 'abc' })).toThrow();
      expect(() => customScalar.parseLiteral({ kind: Kind.INT, value: '-1' })).toThrow();
      expect(() => customScalar.parseLiteral({ kind: Kind.INT, value: '101' })).toThrow();
      expect(() => customScalar.parseLiteral({ kind: Kind.STRING, value: '10' })).toThrow();
    });
  });
});