import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver } from '@nestjs/graphql';
import { SessionInstrument } from 'frontend/graphql.schema';
import { PoliciesGuard } from 'frontend/guards/policy.guard';
import { SessionInstrumentsService } from './session-instruments.service';
import { readSessionsPolicy } from 'frontend/casl/casl.policies';
import { CheckPolicies } from 'common/decorators/checkPolicy.decorator';

@Resolver()
@UseGuards(PoliciesGuard)
export class SessionInstrumentsResolver {
  constructor(
    private readonly sessionInstrumentsService: SessionInstrumentsService,
  ) {}

  @Query('getSessionInstruments')
  @CheckPolicies(readSessionsPolicy)
  async getSessionInstruments(
    @Args('session_id') sessionId: number,
  ): Promise<SessionInstrument[]> {
    return this.sessionInstrumentsService.getSessionInstruments(sessionId);
  }
}
