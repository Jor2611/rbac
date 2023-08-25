import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
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
  async fetch(@Req() req: Request, @Param('id') id: string){
    if(req.accessType === 'self'){
      await this.accountService.checkOwnership(req.decoded.id,parseInt(id));
    }
    return this.accountService.findOneBy({ id: parseInt(id) });
  }

  @Post('signup')
  signUp(@Body() body: SignUpDto){
    return this.accountService.signUp(body);
  }

  @Post('signin')
  signIn(@Body() body: SignInDto){
    return this.accountService.signIn(body);
  }

  
  @Patch(':id')
  @ACL('account','update')
  async update(@Req() req: Request, @Param('id') id: string, @Body() body: UpdateAccountDto){
    if(req.accessType === 'self'){
      await this.accountService.checkOwnership(req.decoded.id,parseInt(id));
    }
    return this.accountService.update(parseInt(id), body);
  }
}
