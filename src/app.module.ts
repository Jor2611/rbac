import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './account/account.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './dataSource.options';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { RBACGuard } from './guards/rbac.guard';
import { AccountService } from './account/account.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TokenParse } from './middlewares/token-parse.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV === "production" 
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => dataSourceOptions
    }),
    JwtModule.register({}),
    AccountModule
  ],
  controllers: [AppController],
  providers: [
    AccountService,
    AppService,
    {
      provide: APP_PIPE,
      useFactory: () => new ValidationPipe({ whitelist: true })
    },
    {
      provide: APP_GUARD,
      useClass: RBACGuard
    },
    JwtService
  ],
  exports: [JwtModule]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer){
    consumer.apply(TokenParse)
      .forRoutes('*')
  }
}
