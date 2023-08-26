import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { mockAccount } from '../../test/mockedData';
import { Account } from './account.entity';
import { SignUpDto } from './dtos/signup.dto';
import { SignInDto } from './dtos/signin.dto';
import { ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

const { 
  email, 
  updatedEmail, 
  password, 
  updatedPassword, 
  role, 
  token 
} = mockAccount;

describe('AccountController', () => {
  let controller: AccountController;
  let mockAccountService: Partial<AccountService>;
  let accounts = [];

  beforeEach(async () => {
    mockAccountService = {
      findOneBy:(filter) => {
        const [account] = accounts.filter(item => item.id===filter.id);
        return Promise.resolve(account);
      },
      signUp:(data: SignUpDto) => {
        const account = { id: Math.floor(Math.random() * 999), email, password, role, token, reports: [] };
        accounts.push(account);
        return Promise.resolve(account);
      },
      signIn:(data: SignInDto) => {
        const [account] = accounts.filter(item => item.email == email && item.password == password);
        return Promise.resolve(account);
      },
      update:(id: number, attrs: Partial<Account>) => {
        const [account] = accounts.filter(item => item.id == id);
        Object.assign(account,attrs);
        return Promise.resolve(account);
      },
      remove: (id: number) => {
        accounts = accounts.filter(item => item.id !== id);

        return Promise.resolve({ id });
      },
      checkOwnership: (ownerId: number, accountId: number) => {
        if(ownerId !== accountId){
          throw new ForbiddenException();
        }
        return Promise.resolve();
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: mockAccountService
        }
      ]
    }).compile();

    controller = module.get<AccountController>(AccountController);
  });

  afterEach(async() => {
    accounts = [];
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should fetch an account by ID', async() => {
    const { id } = await controller.signUp({ email, password, role});
    const req = { accessType: 'self', decoded: { id } } as Request;
    const account = await controller.fetch(req, id);

    expect(account).toBeDefined();
    expect(account.id).toEqual(id);
  });

  it('should not fetch an account by ID if accessType is self but account is not owned', async() => {
    const { id } = await controller.signUp({ email, password, role});
    const req = { accessType: 'self', decoded: { id: id+10 } } as Request;
    
    expect(controller.fetch(req, id)).rejects.toThrow(ForbiddenException);
    expect(accounts.length).toEqual(1);
  });

  it('should signup a new account', async() => {
    const account = await controller.signUp({ email, password, role });

    expect(account).toBeDefined();
    expect(account.token).toBeDefined();
    expect(accounts).toHaveLength(1);
  });

  it('should sign in an account', async() => {
    const account = await controller.signUp({ email, password, role});
    const signedAccount = await controller.signIn({ email, password });

    expect(account).toBeDefined();
    expect(signedAccount).toBeDefined();
    expect(accounts).toHaveLength(1);
    expect(account.id).toEqual(signedAccount.id);
    expect(signedAccount.token).toBeDefined();
  });

  it('should update an account', async() => {
    const { ...account } = await controller.signUp({ email, password, role});
    const  req = { accessType: 'self', decoded: { id: account.id } } as Request;
    const updatedAccount = await controller.update(req, account.id, { email: updatedEmail, password: updatedPassword });

    expect(accounts).toHaveLength(1);
    expect(account.id).toEqual(updatedAccount.id);
    expect(account.email).not.toEqual(updatedAccount.email);
  });

  it('should not update an account if accessType is self but account is not owned', async() => {
    const { ...account } = await controller.signUp({ email, password, role});
    const  req = { accessType: 'self', decoded: { id: account.id + 10 } } as Request;
    const updateBody = { email: updatedEmail, password: updatedPassword };

    expect(controller.update(req, account.id, updateBody)).rejects.toThrow(ForbiddenException);
    expect(accounts).toHaveLength(1);
  });

  it('should remove an account', async() => {
    const account = await controller.signUp({ email, password, role});
    const  req = { accessType: 'self', decoded: { id: account.id } } as Request;
    const result = await controller.remove(req, account.id);

    expect(accounts).toHaveLength(0);
    expect(result).toEqual({ id: account.id});
  });

  it('should not remove an account if accessType is self but account is not owned', async() => {
    const account = await controller.signUp({ email, password, role});
    const  req = { accessType: 'self', decoded: { id: account.id+10 } } as Request;
    
    expect(controller.remove(req, account.id)).rejects.toThrow(ForbiddenException);
    expect(accounts).toHaveLength(1);
  });

});
