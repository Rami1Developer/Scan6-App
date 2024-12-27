import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import { OTP, OTPSchema } from './schemas/o-t-p.schema';
import { MailService } from 'src/mail/mail.service';



@Module({
  imports: [
    
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: RefreshToken.name,
        schema: RefreshTokenSchema,
      },
      {
        name: OTP.name,
        schema: OTPSchema,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService],
  exports: [AuthService, MongooseModule],
})
export class AuthModule {}