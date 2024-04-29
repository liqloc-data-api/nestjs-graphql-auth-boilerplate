import { Injectable } from '@nestjs/common';
import {
  SESSION_TO_ACTION_MAPPER,
  SUBJECT_TO_ARGS_MAPPER,
  TRADER_ID_FOR_BOOK_LEVEL,
} from './casl.config';
import { ActionE, SessionStateE, SubjectE } from '../../utils/enum';
import { hasMandatoryKeysWithValues, getEnumKeyFromValue } from '../../utils/helper.functions';
import { UserActiveSessionBook } from 'graphql.schema';

@Injectable()
export class CaslService {
  private static readonly sessionActionMapper: Map<SessionStateE, { [key in SubjectE]?: Map<ActionE, ActionE[]> }> = SESSION_TO_ACTION_MAPPER;
  private static readonly subjectToArgsMapper: Map<SubjectE, string[]> = SUBJECT_TO_ARGS_MAPPER;
  
  constructor() {}

  getActionAndSubject(
    {
      action,
      subject,
    }: {
      action: ActionE;
      subject: SubjectE;
    },
    sessionState: SessionStateE,
  ): [ActionE[], SubjectE] {
    const actionList = this.getActionList(action, subject, sessionState);
    return [actionList, subject];
  }

  isValidPermission(args: any, permission: any): boolean {
    let trader_id_check = args?.trader_id === permission?.trader_id;
    if (permission?.subject === SubjectE.LIMITS) {
      trader_id_check = trader_id_check || args?.trader_id === TRADER_ID_FOR_BOOK_LEVEL;
    }

    return Boolean(
      this.validateArgsForSubject(
        args,
        permission?.subject
      ) &&
      args?.book_id === permission?.book_id &&
      trader_id_check);
    ;
  }

  getSessionStatus(
    userSessionData: UserActiveSessionBook[],
    args: any,
  ): SessionStateE | undefined {
    let sessionStatus;
    userSessionData.forEach((element) => {
      if (
        element?.book_id === args?.book_id &&
        element?.session_id === args?.session_id
      ) {
        sessionStatus = element?.session_state;
        return sessionStatus
      }
    });
    return sessionStatus;
  }

  validateArgsForSubject(args: any, subject: SubjectE): boolean {
    const listOfMandatoryArgs = this.getMandatoryArgsForSubject(subject);
    return hasMandatoryKeysWithValues(args, listOfMandatoryArgs);
  }

  private getActionMapper(sessionState: SessionStateE, subject: SubjectE): Map<string, ActionE[]> {
    const mapper_obj = CaslService.sessionActionMapper.get(sessionState)
    const subjectMapper =  mapper_obj?.[subject] || mapper_obj?.[SubjectE.DEFAULT];
    return subjectMapper;
  }

  private getMandatoryArgsForSubject(subject: SubjectE): string[] {
    return CaslService.subjectToArgsMapper.get(subject);
  }

  private getActionList(
    action: ActionE,
    subject: SubjectE,
    sessionState: SessionStateE,
  ): ActionE[] {
    return this.getActionMapper(sessionState, subject)?.get(action);
  }
};


