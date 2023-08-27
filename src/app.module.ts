import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './account/account.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './dataSource.options';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
      ignoreEnvFile: !`.env.${process.env.NODE_ENV}`
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => dataSourceOptions
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config:ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRATION') }
      })
    }),
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
    }
  ],
  exports: [JwtModule]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer){
    consumer.apply(TokenParse)
      .forRoutes('*')
  }
}
