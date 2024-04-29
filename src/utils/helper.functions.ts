import { SubjectE } from './enum';

export function hasMandatoryKeysWithValues(
  obj: any,
  mandatoryKeys: string[],
): boolean {
  return mandatoryKeys?.every(
    (key) => obj?.hasOwnProperty(key) && obj[key] != null,
  );
}

export function mergeJsonObjects(
  obj1: Record<string, any>,
  obj2: Record<string, any>,
): Record<string, any> {
  let merged = {};

  let keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of keys) {
    if (obj1[key] instanceof Object && obj2[key] instanceof Object) {
      merged[key] = mergeJsonObjects(obj1[key], obj2[key]);
    } else {
      merged[key] = obj2[key] !== undefined ? obj2[key] : obj1[key];
    }
  }

  return merged;
}

export function getEnumKeyFromValue(
  value: string,
): keyof typeof SubjectE | undefined {
  for (let key in SubjectE) {
    if (SubjectE[key as keyof typeof SubjectE] === value) {
      return key as keyof typeof SubjectE;
    }
  }
  return undefined;
}

export function isEmpty(value: any): boolean {
  return (
    value === null || value === undefined || value === '' || Number.isNaN(value)
  );
}
