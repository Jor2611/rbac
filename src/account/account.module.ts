import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config:ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions:{ expiresIn: config.get<string>('JWT_EXPIRATION') }
      })
    })
  ],
  providers: [AccountService],
  controllers: [AccountController],
  exports: [AccountService, TypeOrmModule]
})
export class AccountModule {}
