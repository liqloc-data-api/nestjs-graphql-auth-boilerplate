import * as z from 'zod';

interface ValidationStatusI {
  status: boolean;
  errors: any[];
  data?: any;
}

export function validationObject(
  object: Record<string, any>,
  zObject: z.ZodObject<any, any> | z.ZodEffects<any, any>,
): ValidationStatusI {
  const validationErrors = [];
  try {
    object = zObject.parse(object);
  } catch (error) {
    validationErrors.push({ object, errors: error.errors });
  }
  if (validationErrors.length > 0) {
    return { status: false, errors: validationErrors };
  } else {
    return { status: true, errors: [], data: object };
  }
}

export function validateFieldInObject(
  object: Record<string, any>,
  field: string,
  zObject: z.ZodObject<any, any> | z.ZodEffects<any, any>,
): ValidationStatusI {
  const validationErrors = [];
  try {
    let dataObj = object.hasOwnProperty(field) ? object[field] : null;
    if (dataObj) {
      object[field] = zObject.parse(dataObj);
    } else {
      throw new Error(`Field ${field} is missing in object`);
    }
  } catch (error) {
    validationErrors.push({ object, errors: error.errors });
  }
  if (validationErrors.length > 0) {
    return { status: false, errors: validationErrors };
  } else {
    return { status: true, errors: [], data: object };
  }
}

export function validateFieldInObjectArray(
  objectArray: Record<string, any>[],
  field: string,
  zObject: z.ZodObject<any, any> | z.ZodEffects<any, any>,
): ValidationStatusI {
  const validationErrors = [];
  const updatedObjectArray = [];
  objectArray.forEach((object) => {
    const { status, errors, data } = validateFieldInObject(
      object,
      field,
      zObject,
    );
    if (!status) {
      validationErrors.push(...errors);
    }
    updatedObjectArray.push(data || object);
  });
  if (validationErrors.length > 0) {
    return { status: false, errors: validationErrors };
  } else {
    return { status: true, errors: [], data: updatedObjectArray };
  }
}

export function validateFieldInObjectArrayDynamic(
  objectArray: Record<string, any>[],
  field: string,
  type_filed: string,
  zObjectFn: (num: number) => z.ZodObject<any, any> | z.ZodEffects<any, any>,
): ValidationStatusI {
  const validationErrors = [];
  const updatedObjectArray = [];
  objectArray.forEach((object) => {
    const zObject = zObjectFn(object[type_filed]);
    if (!zObject) {
      updatedObjectArray.push(object);
      return;
    }
    const { status, errors, data } = validateFieldInObject(
      object,
      field,
      zObject,
    );
    if (!status) {
      validationErrors.push(...errors);
    }
    updatedObjectArray.push(data || object);
  });
  if (validationErrors.length > 0) {
    return { status: false, errors: validationErrors };
  } else {
    return { status: true, errors: [], data: updatedObjectArray };
  }
}

export function roundingToDecimal(value: number, decimal: number): number {
  return Math.round(value * Math.pow(10, decimal)) / Math.pow(10, decimal);
}
