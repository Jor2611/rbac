import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    JwtModule,
  ],
  providers: [AccountService],
  controllers: [AccountController],
  exports: [AccountService, TypeOrmModule]
})
export class AccountModule {}
