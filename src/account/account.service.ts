import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { Roles } from './constants/rolePermissions';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const scrypt = promisify(_scrypt);

interface AccountFilter {
  id?: number,
  email?: string
}

interface CreateAccountData {
  email: string;
  password: string;
  role?: Roles
}

interface LoginAccountData {
  email: string;
  password: string;
}

interface UpdateAccountData{
  email?: string,
  password?: string,
  role?: Roles, 
}

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account) private repository: Repository<Account>, 
    private jwtService: JwtService 
  ){}

  create(data: CreateAccountData){
    const account = this.repository.create(data);
    return this.repository.save(account);
  }

  findBy(filter: AccountFilter){
    return this.repository.findBy(filter);
  }

  findOneBy(filter: AccountFilter) {
    return this.repository.findOneBy(filter) || null;
  }

  async signUp(data: CreateAccountData) {
    const accounts = await this.findBy({ email: data.email });
    
    if(accounts.length){
      throw new BadRequestException('Email is taken!');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(data.password, salt, 32)) as Buffer;
    const hashedPassword = `${salt}.${hash.toString('hex')}`;

    const account = await this.create({ ...data, password: hashedPassword });
    const payload = { id: account.id, email: account.email, role: account.role };
    const token = await this.jwtService.signAsync(payload);

    return { ...account, token };
  }

  async signIn(data: LoginAccountData) {
    const account = await this.findOneBy({ email: data.email });
    
    if(!account){
      throw new BadRequestException('Wrong credentials');
    }

    const [salt, storedHash] = account.password.split('.');
    const hash = (await scrypt(data.password, salt, 32)) as Buffer;

    if(storedHash !== hash.toString('hex')){
      throw new BadRequestException('Wrong credentials');
    }

    const payload = { id: account.id, email: account.email, role: account.role };
    const token = await this.jwtService.signAsync(payload);

    return { ...account, token };
  }

  async update(id: number, attrs: UpdateAccountData){
    const account = await this.findOneBy({ id });
    
    if(!account){
      throw new NotFoundException('Account not found!');
    }
    
    if(attrs.password){
      const salt = randomBytes(8).toString('hex');
      const hash = (await scrypt(attrs.password, salt, 32)) as Buffer;
      attrs.password = `${salt}.${hash.toString('hex')}`;
    }

    Object.assign(account, attrs);

    return this.repository.save(account);
  }

  async remove(id: number){
    const account = await this.findOneBy({ id });
    
    if(!account){
      throw new NotFoundException('Account not found!');
    }

    await this.repository.remove(account);
    return { id };
  }

  async checkOwnership(ownerId: number, accountId: number){
    if(ownerId !== accountId){
      throw new ForbiddenException();
    }
  }
}
