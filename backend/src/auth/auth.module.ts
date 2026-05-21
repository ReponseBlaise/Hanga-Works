import passport from 'passport';
import { initJwtStrategy } from './jwt.strategy';

export class AuthModule {
  static init() {
    initJwtStrategy();
    return passport.initialize();
  }
}
