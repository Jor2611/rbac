import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockAccount } from '../../test/mockedData';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

const { 
  fakeId, 
  email, 
  updatedEmail, 
  password, 
  updatedPassword,
  role,
  token: mockToken
} = mockAccount;

let accounts: Account[] = [];

describe('AccountService', () => {
  let service: AccountService;
  let repo: Repository<Account>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getRepositoryToken(Account),
          useValue: {
            findOneBy: jest.fn().mockImplementation((arg) => {
              const [[key,value]]= Object.entries(arg);
              return accounts.find(account => account[key] === value);
            }),
            findBy: jest.fn().mockImplementation((arg) => {
              const [[key,value]]= Object.entries(arg);
              return accounts.filter(account => account[key] === value);
            }),
            create: jest.fn().mockImplementation((args) => {
              const account = {...args, id: Math.floor(Math.random()*999)} as Account;
              accounts.push(account);
              return account;
            }),
            save: jest.fn().mockImplementation((args) => {   
              return args;
            }),
            remove: jest.fn().mockImplementation((arg) => {
              let accountToRemove: Account;
              accounts = accounts.filter(account => {
                if(account.id === arg.id){
                  accountToRemove = account; 
                }
                return account.id !== arg.id
              })

              return { email: accountToRemove.email, role: accountToRemove.role };
            })
          }
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockImplementation(() => {
              return mockToken;
            })
          }
        }
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    repo = module.get<Repository<Account>>(getRepositoryToken(Account));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(async() => {
    accounts = [];
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new account and return token', async() => {
    const spyOnFindBy = jest.spyOn(repo, 'findBy');
    const spyOnCreate = jest.spyOn(repo, 'create');
    const spyOneSave = jest.spyOn(repo, 'save');
    const spyOnJwt = jest.spyOn(jwtService, 'signAsync');

    const { token, ...account } = await service.signUp({ email, password, role });

    expect(spyOnFindBy).toBeCalledWith({ email });
    expect(spyOnCreate).toBeCalledWith({ email, password: account.password, role });
    expect(spyOneSave).toBeCalledWith(account);
    expect(spyOnJwt).toBeCalledWith({ id: account.id, email, role });
    expect(account).toBeDefined();
    expect(token).toBeDefined();
    expect(accounts).toHaveLength(1);
  });

  it('should throw BadRequestException if email already exists', async() => {
    const spyOnFindBy = jest.spyOn(repo, 'findBy');
    
    await service.signUp({ email, password, role });

    expect(spyOnFindBy).toBeCalledWith({ email });
    expect(service.signUp({ email, password, role }))
    .rejects.toThrow(BadRequestException);
  });

  it('should create a new account with encrypted password', async() => {
    const account = await service.signUp({ email, password, role });
    const [salt,hash] = account.password.split('.');

    expect(account).toBeDefined();
    expect(password).not.toBe(account.password);
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('should sign in an existing account and return a token', async() => {
    const spyOnFindOneBy = jest.spyOn(repo, 'findOneBy');
    
    await service.signUp({ email, password, role });
    const account = await service.signIn({ email, password });

    expect(spyOnFindOneBy).toBeCalledWith({ email });
    expect(accounts).toHaveLength(1);
    expect(account).toBeDefined();
    expect(account.token).toBeDefined();
  });

  it('should throw a BadRequestException for invalid email', async() => {
    const fakeEmail = 'fake@gmail.com'; 
    const spyOnFindOneBy = jest.spyOn(repo, 'findOneBy');

    await service.signUp({ email, password, role });

    expect(service.signIn({ email: fakeEmail, password })).rejects.toThrow(BadRequestException);
    expect(spyOnFindOneBy).toBeCalledWith({ email: fakeEmail });
  });

  it('should throw a BadRequestException for invalid password', async() => {
    const spyOnFindBy = jest.spyOn(repo, 'findBy');

    await service.signUp({ email, password, role });

    expect(spyOnFindBy).toBeCalledWith({ email });
    expect(accounts).toHaveLength(1);
    expect(service.signIn({ email, password: 'wrongpassword' })).rejects.toThrow(BadRequestException);
  });

  it('should retrieve an account with the provided id', async() => {
    const spyOnFindOneBy = jest.spyOn(repo, 'findOneBy');

    const { id } = await service.signUp({ email, password, role });
    const account = await service.findOneBy({ id });

    expect(spyOnFindOneBy).toBeCalledWith({ id });
    expect(accounts).toHaveLength(1);
    expect(account).toBeDefined();
    expect(account.id).toEqual(id);
    expect(account.email).toEqual(email);
  });
  
  it('should return null when fetching an account with a null ID', async() => {
    await service.signUp({ email, password, role });
    const account = await service.findOneBy({ id: null });

    expect(accounts).toHaveLength(1);
    expect(account).toBeNull();
  });

  it('should update the account, if provided correct id and attributes', async() => {
    const spyOneFindOneBy = jest.spyOn(repo,'findOneBy');
    const spyOneSave = jest.spyOn(repo,'save');

    //////////////////////////////////////////////////////////
    /// Destructuring account object to avoid interference ///
    /// with the updatedAccount during testing.            ///
    //////////////////////////////////////////////////////////

    const { id, ...account } = await service.signUp({ email, password, role });

    const updatedAccount = await service.update(id, { 
      email: updatedEmail, 
      password: updatedPassword 
    });

    //Attempt to signin with updated password
    const signedInAccount = await service.signIn({ email: updatedEmail, password: updatedPassword });
      
    expect(accounts).toHaveLength(1);
    expect(account).toBeDefined();
    expect(updatedAccount).toBeDefined();
    expect(spyOneFindOneBy).toBeCalledTimes(2);
    expect(spyOneSave).toBeCalledTimes(2);
    expect(id).toEqual(updatedAccount.id);
    expect(account.email).not.toEqual(updatedAccount.email);
    expect(signedInAccount).toBeDefined();
    expect(signedInAccount.id).toEqual(updatedAccount.id);
  });


  it('should throw a NotFound error when updating an account with an incorrect ID',async() => {
    const { id } = await service.signUp({ email, password, role });

    expect(accounts).toHaveLength(1);
    expect(id).not.toEqual(fakeId);
    expect(service.update(fakeId,{ email: updatedEmail })).rejects.toThrow(NotFoundException);
  });

  it('should remove an account with provided id', async() => {
    const spyOnFindOneBy = jest.spyOn(repo,'findOneBy');
    const spyOnRemove = jest.spyOn(repo,'remove');

    const { token, ...account } = await service.signUp({ email, password, role });
    const result = await service.remove(account.id);

    expect(accounts).toHaveLength(0);
    expect(spyOnFindOneBy).toBeCalledWith({ id: account.id });
    expect(spyOnRemove).toBeCalledWith(account);
    expect(result).toEqual({ id: account.id });
  });

  it('should throw a NotFound error when attempting to remove a non-existing account', async() => {
    const spyOnFindOneBy = jest.spyOn(repo,'findOneBy');
    const spyOnRemove = jest.spyOn(repo,'remove');

    const account = await service.signUp({ email, password, role });

    expect(accounts).toHaveLength(1);
    expect(fakeId).not.toEqual(account.id);
    expect(service.remove(fakeId)).rejects.toThrow(NotFoundException);
    expect(spyOnFindOneBy).toBeCalledWith({ id: fakeId });
    expect(spyOnRemove).not.toBeCalled();
  });

  it('should check account ownership and throw Forbidden error if account is not owned',async() => {
    const ownerId = Math.floor(Math.random() * 999);
    const accountId = ownerId + 1;

    expect(service.checkOwnership(ownerId, accountId)).rejects.toThrow(ForbiddenException);
  });
});
