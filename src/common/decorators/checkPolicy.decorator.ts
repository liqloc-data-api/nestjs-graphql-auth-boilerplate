import { SetMetadata } from '@nestjs/common';
import { PolicyHandler } from '../../frontend/guards/policy.handler';

export const CHECK_POLICIES_KEY = 'checkPolicies';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
