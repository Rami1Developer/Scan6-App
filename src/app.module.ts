import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OcrModule } from './ocr/ocr.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { MailService } from './mail/mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import config from './config/config';
import { AuthModule } from './auth/auth.module';



@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        secret: config.get('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        uri: config.get('database.connectionString'),
      }),
      inject: [ConfigService],
    }), OcrModule, AuthModule,

  ],

  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, MailService],
})
export class AppModule { }
