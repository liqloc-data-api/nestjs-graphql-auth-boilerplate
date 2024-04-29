import {
  CanActivate,
  ExecutionContext,
  Injectable,
  MethodNotAllowedException,
  Scope,
  Type,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PolicyHandler } from './policy.handler';
import { CHECK_POLICIES_KEY } from '../../common/decorators/checkPolicy.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CASLAbilityFactory } from 'frontend/casl/casl-ability.factory';

@Injectable({ scope: Scope.REQUEST })
export class PoliciesGuard implements CanActivate {
  constructor(private reflector: Reflector, private abilityFactory: CASLAbilityFactory) {
    // super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // await super.canActivate(context);
    const ctx = GqlExecutionContext.create(context);

    const { user } = ctx.getContext().req;

    // get arguments from context
    const args = ctx.getArgs();

    const ability = this.abilityFactory.createForUser(user, args);

    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    // Throw unauthorized error if policy is not set for query and mutation.
    if (
      policyHandlers.length === 0 &&
      context.getClass().name !== 'UserMeResolver'
    ) {
      console.trace("No policies set for policy");
      throw new MethodNotAllowedException(
        `No policies set for ${context.getClass().name}.${context.getHandler().name}()`,
      );
    }

    return policyHandlers.every((handler) => {
      return typeof handler === 'function'
        ? handler(ability)
        : handler.handle(ability);
    });
  }
}