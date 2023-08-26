import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { AccountService } from './account.service';
import { SignUpDto } from './dtos/signup.dto';
import { UpdateAccountDto } from './dtos/update-account.dto';
import { SignInDto } from './dtos/signin.dto';
import { Serialize } from '../decorators/serialize.decorator';
import { ResponseDto } from './dtos/response.dto';
import { Request } from 'express';
import { ACL } from '../decorators/acl.decorator';

@Controller('account')
@Serialize(ResponseDto)
export class AccountController {
  constructor(private accountService: AccountService){}

  @Get(':id')
  @ACL('account','read')
  async fetch(@Req() req: Request, @Param('id', new ParseIntPipe()) id: number){
    if(req.accessType === 'self'){
      await this.accountService.checkOwnership(req.decoded.id, id);
    }
    return this.accountService.findOneBy({ id });
  }

  @Post('signup')
  signUp(@Body() body: SignUpDto){
    return this.accountService.signUp(body);
  }

  @Post('signin')
  @HttpCode(200)
  signIn(@Body() body: SignInDto){
    return this.accountService.signIn(body);
  }

  @Patch(':id')
  @ACL('account','update')
  async update(@Req() req: Request, @Param('id', new ParseIntPipe()) id: number, @Body() body: UpdateAccountDto){
    if(req.accessType === 'self'){
      await this.accountService.checkOwnership(req.decoded.id, id);
    }
    return this.accountService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ACL('account','delete')
  async remove(@Req() req: Request, @Param('id', new ParseIntPipe()) id: number){
    if(req.accessType === 'self'){
      await this.accountService.checkOwnership(req.decoded.id, id);
    }
    return this.accountService.remove(id);
  }
}
