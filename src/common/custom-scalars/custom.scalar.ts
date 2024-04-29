import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import * as moment from 'moment';

export enum ScalarTypeEnum {
  INT = 'int',
  FLOAT = 'float',
}

interface NumberRangeScalarConfig {
  name: string;
  description: string;
  min: number;
  max: number;
  type: ScalarTypeEnum;
}

export function NumberRangeScalarFactory({
  name,
  description,
  min,
  max,
  type,
}: NumberRangeScalarConfig): any {
  const validationFunction = (value: any): number => {
    const parsedValue =
      type === 'int' ? Math.round(parseFloat(value)) : parseFloat(value);
    if (isNaN(parsedValue) || parsedValue < min || parsedValue > max) {
      throw new Error(
        `Value must be a valid ${
          type === 'int' ? 'integer' : 'float'
        } between ${min} and ${max}`,
      );
    }
    return parsedValue;
  };
  @Scalar(name)
  class NumberRangeScalar implements CustomScalar<any, number> {
    description = description;

    serialize(value: any): number {
      return validationFunction(value);
    }

    parseValue(value: any) {
      return validationFunction(value);
    }

    parseLiteral(ast: ValueNode) {
      if (ast.kind === Kind.INT || ast.kind === Kind.FLOAT) {
        return validationFunction(ast.value);
      }
      throw new Error(`Invalid literal type for ${name}`);
    }
  }
  return NumberRangeScalar;
}

export const DV01Scalar = NumberRangeScalarFactory({
  name: 'DV01',
  description: 'DV01',
  min: 0,
  max: 100,
  type: ScalarTypeEnum.INT,
});


@Scalar('DateYYYYMMDD')
export class DateYYYYMMDDScalar implements CustomScalar<any, string> {
  description = 'Date custom scalar type';

  serialize(value: any): string {
    return moment(value).format('YYYY-MM-DD');
  }

  parseValue(value: any) {
    return moment(value).format('YYYY-MM-DD');
  }

  parseLiteral(ast: ValueNode) {
    if (ast.kind === Kind.STRING) {
      return moment(ast.value).format('YYYY-MM-DD');
    }
    throw new Error(`Invalid literal type for Date`);
  }
}
