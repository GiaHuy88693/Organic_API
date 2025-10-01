import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AUTH_TYPE_KEY,
  AuthTypes,
  ConditionGuard,
} from 'src/shared/constants/auth.constant';
import { AuthTypeDecoratorPayload } from '../decorator/auth.decorator';
import { AccessTokenGuard } from './access-token.guard';
import { ApiKeyGuard } from './api-key.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private get authTypeGuardMap(): Record<string, CanActivate> {
    return {
      [AuthTypes.BEARER]: this.accessTokenGuard,
      [AuthTypes.APIKey]: this.apiKeyGuard,
      [AuthTypes.NONE]: { canActivate: () => true },
    };
  }

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.reflector.getAllAndOverride<
      AuthTypeDecoratorPayload | undefined
    >(AUTH_TYPE_KEY, [context.getHandler(), context.getClass()]) ?? {
      authTypes: [AuthTypes.NONE],
      options: { condition: ConditionGuard.AND },
    };
    const guards = authTypeValue.authTypes.map(
      (authType) => this.authTypeGuardMap[authType],
    );
    let error = new UnauthorizedException();
    if (authTypeValue.options.condition === ConditionGuard.OR) {
      for (const instance of guards) {
        try {
          const canActivate = await instance.canActivate(context);
          if (canActivate) return true;
        } catch (err) {
          error = err;
        }
      }
      throw error;
    } else {
      for (const instance of guards) {
        try {
          const canActivate = await instance.canActivate(context);
          if (!canActivate) throw new UnauthorizedException();
        } catch (err) {
          throw err instanceof UnauthorizedException
            ? err
            : new UnauthorizedException();
        }
      }
      return true;
    }
  }
}
