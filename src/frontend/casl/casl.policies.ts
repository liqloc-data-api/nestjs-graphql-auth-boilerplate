import { ActionE, SubjectE } from 'utils/enum';
import { AppAbility } from './casl-ability.factory';

/* Read policies*/
export const readMePolicy: (ability: AppAbility) => boolean = (ability) => {
  return ability.can(ActionE.READ, SubjectE.ME);
};

export const readLimitsPolicy: (ability: AppAbility) => boolean = (ability) => {
  return ability.can(ActionE.READ, SubjectE.LIMITS);
};

export const readCurvesPolicy: (ability: AppAbility) => boolean = (ability) => {
  return ability.can(ActionE.READ, SubjectE.CURVES);
};

export const readSessionsPolicy: (ability: AppAbility) => boolean = (
  ability,
) => {
  return ability.can(ActionE.READ, SubjectE.SESSIONS);
};

export const readOrdersPolicy: (ability: AppAbility) => boolean = (ability) => {
  return ability.can(ActionE.READ, SubjectE.ORDERS);
};

/* Write policies*/
export const writeCurvesPolicy: (ability: AppAbility) => boolean = (
  ability,
) => {
  return ability.can(ActionE.WRITE, SubjectE.CURVES);
};

export const writeLimitsPolicy: (ability: AppAbility) => boolean = (
  ability,
) => {
  return ability.can(ActionE.WRITE, SubjectE.LIMITS);
};

export const writeOrdersPolicy: (ability: AppAbility) => boolean = (
  ability,
) => {
  return ability.can(ActionE.WRITE, SubjectE.ORDERS);
};

export const writeDemoPolicy: (ability: AppAbility) => boolean = (ability) => {
  return ability.can(ActionE.WRITE, SubjectE.DEMO);
};

/* Upload policies*/
export const uploadCurvesPolicy: (ability: AppAbility) => boolean = (
  ability,
) => {
  return ability.can(ActionE.UPLOAD, SubjectE.CURVES);
};

export const uploadLimitsPolicy: (ability: AppAbility) => boolean = (
  ability,
) => {
  return ability.can(ActionE.UPLOAD, SubjectE.LIMITS);
};

export const uploadOrdersPolicy: (ability: AppAbility) => boolean = (
  ability,
) => {
  return ability.can(ActionE.UPLOAD, SubjectE.ORDERS);
};

export const downloadCurvesPolicy: (ability: AppAbility) => boolean = (ability) => {
  return ability.can(ActionE.DOWNLOAD, SubjectE.CURVES);
};

export const downloadLimitsPolicy: (ability: AppAbility) => boolean = (ability) => {
  return ability.can(ActionE.DOWNLOAD, SubjectE.LIMITS);
}

export const downloadOrdersPolicy: (ability: AppAbility) => boolean = (ability) => {
  return ability.can(ActionE.DOWNLOAD, SubjectE.ORDERS);
}
