import { Args, Query, Resolver } from '@nestjs/graphql';
import { SessionsService } from './sessions.service';
import { CheckPolicies } from 'common/decorators/checkPolicy.decorator';
import { readSessionsPolicy } from 'frontend/casl/casl.policies';
import { Session, SessionInstrument } from 'frontend/graphql.schema';
import { PoliciesGuard } from 'frontend/guards/policy.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
@UseGuards(PoliciesGuard)
export class SessionsResolver {
  constructor(private readonly sessionsService: SessionsService) {}

  @Query('getSession')
  @CheckPolicies(readSessionsPolicy)
  async getSession(@Args('session_id') sessionId: number): Promise<Session> {
    return this.sessionsService.getSession(sessionId);
  }
}
