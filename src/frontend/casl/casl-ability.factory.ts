import {
  AbilityBuilder,
  ExtractSubjectType,
  MongoAbility,
  createMongoAbility,
  MongoQuery
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { ActionE, SubjectE } from '../../utils/enum';
import { CaslService } from './casl.service';
import { DEFAULT_ABILITIES } from './casl.config';
import { AppLogger } from 'common/logger/logger.service';



type Subjects = (typeof SubjectE)[keyof typeof SubjectE];

// const Ability = PureAbility as AbilityClass<AppAbility>;

type PossibleAbilities = [ActionE, Subjects];

type Conditions = MongoQuery;

export type AppAbility = MongoAbility<PossibleAbilities, Conditions>;

@Injectable()
export class CASLAbilityFactory {
  constructor(private readonly caslService: CaslService, private readonly logger: AppLogger) {
    this.logger.setContext(CASLAbilityFactory.name)
  }
  createForUser(user, argContext) {
    const { can, cannot, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );
    DEFAULT_ABILITIES.forEach(([subject, actions]: [SubjectE, ActionE[]]) => {
      can(actions, subject);
    }); // readonly access to user_me data
    const sessionState = this.caslService.getSessionStatus(
      user.userMe.active_session_books,
      argContext,
    );
    if (user.userMe.is_demo_user) can([ActionE.WRITE], SubjectE.DEMO); // TODO Temp - Also check subject in permission
    if (sessionState !== undefined) {``
      // Runs only if valid book_is and session_id is provided in args.
      can([ActionE.READ], SubjectE.SESSIONS); //readonly access to session data
      user.userMe.permissions.forEach((permission) => {
        try {
        if (
          this.caslService.isValidPermission(argContext, permission) //check (book_id, trader_id, session_id) match this combination with permissions
        ) {
          const [action, subject] = this.caslService.getActionAndSubject(
            permission,
            sessionState,
          );
          can(action, subject);
        }} catch (error) {
          this.logger.log(`Permission error: ${error}`);
          throw error;
        }
      });
    }

    return build({
      detectSubjectType: (item: any) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
