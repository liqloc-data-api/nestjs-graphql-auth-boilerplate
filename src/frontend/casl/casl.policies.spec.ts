import { AppAbility } from './casl-ability.factory';
import { readMePolicy, readLimitsPolicy } from './casl.policies';
import { ActionE, SubjectE } from 'utils/enum';

describe('CaslPolicies', () => {
  let ability: AppAbility;

  beforeEach(() => {
    ability = {
      can: jest.fn(),
    } as unknown as AppAbility;
  });

  it('should call ability.can with correct arguments for readMePolicy', () => {
    readMePolicy(ability);
    expect(ability.can).toHaveBeenCalledWith(ActionE.READ, SubjectE.ME);
  });

  it('should call ability.can with correct arguments for readLimitsPolicy', () => {
    readLimitsPolicy(ability);
    expect(ability.can).toHaveBeenCalledWith(ActionE.READ, SubjectE.LIMITS);
  });
});