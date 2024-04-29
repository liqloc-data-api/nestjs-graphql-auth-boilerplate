import { AUTH0_ISSUER_URL } from 'environments';
import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { UserMeService } from 'common/user-me/user-me.service';
import { AppLogger } from 'common/logger/logger.service';

@Injectable()
export class AuthzService {
  constructor(
    private httpService: HttpService,
    private readonly userMeService: UserMeService,
    private readonly logger: AppLogger,
    ) {}

  getUserInfo(token: string): Observable<any> {
    const headerRequest = {
      Authorization: `Bearer ${token}`,
    };
    return this.httpService
      .get(`${AUTH0_ISSUER_URL}userinfo`, { headers: headerRequest })
      .pipe(map((response) => response.data));
  }

  async validateUser(userInfo: any): Promise<any> {
    const userMe = await this.userMeService.getMe(userInfo.email);
    if (userMe === null) {
      this.logger.error(`User not in LLGM: ${userInfo.email}`, userInfo);
      throw new UnauthorizedException('Invalid user');
    }
    const permissions = await this.userMeService.getPermissions(
      userMe.user_id,
    );
    this.logger.log(`User internal id: ${userMe.user_id}`, userMe)
    const active_session_books =
      await this.userMeService.getActiveSessionBooks(userMe.user_id);

    const is_demo_user = await this.userMeService.isLLGMAdmin(userMe.user_id);
    return {
      ...userInfo,
      userMe: { ...userMe, permissions, active_session_books, is_demo_user },
    }; 
  }

}
