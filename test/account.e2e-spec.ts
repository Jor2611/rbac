import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { SignUpDto } from '../src/account/dtos/signup.dto';
import { mockAccount } from './mockedData';
import { Roles } from '../src/account/constants/rolePermissions';

describe('AccountController (e2e)', () => {
  let app: INestApplication;
  const { email, password, role, updatedEmail, updatedPassword } = mockAccount;
  const sampleAccount = { email, password, role };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const signUp = async(accountData: SignUpDto) => {
    const { body: account } = await request(app.getHttpServer())
      .post('/account/signup')
      .send(accountData)
      .expect(201);
    
    return account;
  };

  it('should be able to signup as customer | /account/signup (POST)', async() => {
    const { body: account } = await request(app.getHttpServer())
      .post('/account/signup')
      .send(sampleAccount)
      .expect(201);

    expect(account).toBeDefined();
    expect(account.id).toBeDefined();
    expect(account.token).toBeDefined();
    expect(account.role).toEqual(Roles.Customer);
  });

  it('should be able to signup as manager | /account/signup (POST)', async() => {
    const { body: account } = await request(app.getHttpServer())
      .post('/account/signup')
      .send({ ...sampleAccount, role: Roles.Manager })
      .expect(201);

    expect(account).toBeDefined();
    expect(account.id).toBeDefined();
    expect(account.token).toBeDefined();
    expect(account.role).toEqual(Roles.Manager);
  });

  it('should be able to signup as customer if role is not provided | /account/signup (POST)', async() => {
    const { body: account } = await request(app.getHttpServer())
      .post('/account/signup')
      .send({ email, password })
      .expect(201);

    expect(account).toBeDefined();
    expect(account.id).toBeDefined();
    expect(account.token).toBeDefined();
    expect(account.role).toEqual(Roles.Customer);
  });

  it('should be able to signup as customer if role is not provided | /account/signup (POST)', async() => {
    const { body: account } = await request(app.getHttpServer())
      .post('/account/signup')
      .send({ email, password })
      .expect(201);

    expect(account).toBeDefined();
    expect(account.id).toBeDefined();
    expect(account.token).toBeDefined();
    expect(account.role).toEqual(Roles.Customer);
  });

  it('should return BadRequest exception when attempting to signup with an existing account email | /account/signup (POST)', async() => {
    await signUp(sampleAccount);
    await request(app.getHttpServer())
      .post('/account/signup')
      .send(sampleAccount)
      .expect(400);
  });

  it('should sign in an existing account and return the account and issued token | /account/signin (POST)', async() => {
    const account = await signUp(sampleAccount);
    const { body: result } = await request(app.getHttpServer())
      .post('/account/signin')
      .send({ email, password })
      .expect(200);
  
    expect(result.id).toEqual(account.id);
    expect(result.role).toEqual(account.role);
    expect(result.email).toEqual(account.email);
    expect(result.token).toBeDefined();
  });

  it('should return a BadRequest error when attempting to sign in with incorrect credentials | /account/signin (POST)', async() => {
    const account = await signUp(sampleAccount);
    await request(app.getHttpServer())
      .post('/account/signin')
      .send({ email, password: updatedPassword })
      .expect(400);

    await request(app.getHttpServer())
      .post('/account/signin')
      .send({ email: updatedEmail, password })
      .expect(400);

    expect(account).toBeDefined();
  });

  it('should fetch the account details for a given account ID, if provided valid token | /account/:id (GET)', async() => {
    const account = await signUp(sampleAccount);
    const { body: fetchedAccount } =  await request(app.getHttpServer())
      .get(`/account/${account.id}`)
      .set({ "Authorization": `Bearer ${account.token}` })
      .expect(200);

    expect(account).toBeDefined();
    expect(fetchedAccount).toBeDefined();  
    expect(account.id).toEqual(fetchedAccount.id);
  });

  it('should fetch other account details with manager account | /account/:id (GET)', async() => {
    const customerAccount = await signUp(sampleAccount);
    const managerAccount = await signUp({ email: updatedEmail, password: updatedEmail, role: Roles.Manager });
    const { body: fetchedAccount } =  await request(app.getHttpServer())
      .get(`/account/${customerAccount.id}`)
      .set({ "Authorization": `Bearer ${managerAccount.token}` })
      .expect(200);

    expect(customerAccount).toBeDefined();
    expect(managerAccount).toBeDefined();
    expect(fetchedAccount).toBeDefined();  
    expect(customerAccount.id).toEqual(fetchedAccount.id);
  });

  it('should return an Unauthorized error when attempting to fetch account details with an invalid or missing token | /account/:id (GET)', async() => {
    const account = await signUp(sampleAccount);
    await request(app.getHttpServer())
      .get(`/account/${1}`)
      .expect(401);

    await request(app.getHttpServer())
      .get(`/account/${1}`)
      .set({ "Authorization": `Bearer gibberishtext` })
      .expect(401);

    expect(account).toBeDefined();
  });

  it('should return an Forbidden exception when attempting to fetch other account details with a customer account | /account/:id (GET)', async() => {
    const account = await signUp(sampleAccount);
    const secondAccount = await signUp({ email: updatedEmail, password: updatedEmail, role: Roles.Customer });
    await request(app.getHttpServer())
      .get(`/account/${secondAccount.id}`)
      .set({ "Authorization": `Bearer ${account.token}` })
      .expect(403);

    expect(account).toBeDefined();
    expect(secondAccount).toBeDefined();
  });
//
  it('should return NotFound exception when attempting to fetch a non-existing account details with a manager account | /account/:id (GET)', async() => {
    const managerAccount = await signUp({ ...sampleAccount, role: Roles.Manager });

    await request(app.getHttpServer())
      .get(`/account/2`)
      .set({ "Authorization": `Bearer ${managerAccount.token}` })
      .expect(404);

    expect(managerAccount).toBeDefined();
  });

  it('should return Forbidden exception when attempting to fetch a non-existing account details with a manager account | /account/:id (GET)', async() => {
    const account = await signUp(sampleAccount);

    await request(app.getHttpServer())
      .get(`/account/2`)
      .set({ "Authorization": `Bearer ${account.token}` })
      .expect(403);

    expect(account).toBeDefined();
  });

  it('should update own account details and return the updated details with customer account | /account/:id (PATCH)',async() => {
    const account = await signUp(sampleAccount);

    await request(app.getHttpServer())
      .patch(`/account/${account.id}`)
      .set({ "Authorization": `Bearer ${account.token}` })
      .send({ email: updatedEmail })
      .expect(200);
    
    const { body: updatedAccount } = await request(app.getHttpServer())
      .get(`/account/${account.id}`)
      .set({ "Authorization": `Bearer ${account.token}` })
      .expect(200);
    
    expect(account).toBeDefined();
    expect(updatedAccount).toBeDefined();
    expect(updatedAccount.id).toEqual(account.id);
    expect(updatedAccount.email).toEqual(updatedEmail);
  });

  it('should update other account details with manager account and return the updated details | /account/:id (PATCH)',async() => {
    const customerAccount = await signUp(sampleAccount);
    const managerAccount = await signUp({ email: "manager@gmail.com", password: "123456", role: Roles.Manager });

    await request(app.getHttpServer())
      .patch(`/account/${customerAccount.id}`)
      .set({ "Authorization": `Bearer ${managerAccount.token}` })
      .send({ email: updatedEmail })
      .expect(200);
    
    const { body: updatedAccount } = await request(app.getHttpServer())
      .get(`/account/${customerAccount.id}`)
      .set({ "Authorization": `Bearer ${customerAccount.token}` })
      .expect(200);
    
    expect(customerAccount).toBeDefined();
    expect(managerAccount).toBeDefined();
    expect(updatedAccount).toBeDefined();
    expect(updatedAccount.id).toEqual(customerAccount.id);
    expect(updatedAccount.email).toEqual(updatedEmail);
    expect(updatedAccount.role).toEqual(Roles.Customer);
  });

  it('should return an Unauthorized error when attempting to update account details with an invalid or missing token | /account/:id (PATCH)', async() => {
    const account = await signUp(sampleAccount);
    await request(app.getHttpServer())
      .patch(`/account/${1}`)
      .send({ email: updatedEmail })
      .expect(401);

    await request(app.getHttpServer())
      .patch(`/account/${1}`)
      .send({ email: updatedEmail })
      .set({ "Authorization": `Bearer gibberishtext` })
      .expect(401);

    expect(account).toBeDefined();
  });

  it('should return an Unauthorized error when attempting to update account details with an invalid or missing token | /account/:id (PATCH)', async() => {
    const account = await signUp(sampleAccount);
    await request(app.getHttpServer())
      .patch(`/account/${1}`)
      .send({ email: updatedEmail })
      .expect(401);

    await request(app.getHttpServer())
      .patch(`/account/${1}`)
      .send({ email: updatedEmail })
      .set({ "Authorization": `Bearer gibberishtext` })
      .expect(401);

    expect(account).toBeDefined();
  });

  it('should return an Forbidden error when attempting to update other account details with a customer account | /account/:id (PATCH)', async() => {
    const account = await signUp(sampleAccount);
    const secondAccount = await signUp({ email: 'customer2@gmail.com', password: '123456', role: Roles.Customer });
    await request(app.getHttpServer())
      .patch(`/account/${1}`)
      .send({ email: updatedEmail })
      .set({ "Authorization": `Bearer ${secondAccount.token}` })
      .expect(403);

    expect(account).toBeDefined();
    expect(secondAccount).toBeDefined();
  });

  it('should remove customer account when requested by owner | /account/:id (DELETE)', async() => {
    const account = await signUp(sampleAccount);
  
    await request(app.getHttpServer())
      .delete(`/account/${account.id}`)
      .set({ 'Authorization': `Bearer ${account.token}` })
      .expect(204);
    
    ///////////////////////////////////////////////////////////////////////////
    /// Returns Unauthorized because account deleted and token still valid, ///
    /// so basically that is unauthorized access.                           ///
    ///////////////////////////////////////////////////////////////////////////
    await request(app.getHttpServer())
      .get(`/account/${account.id}`)
      .set({ 'Authorization': `Bearer ${account.token}` })
      .expect(401);

    expect(account).toBeDefined();
  });

  it('should remove other account when requested by manager | /account/:id (DELETE)', async() => {
    const account = await signUp(sampleAccount);
    const managerAccount = await signUp({ email: updatedEmail, password: updatedPassword, role: Roles.Manager });

    await request(app.getHttpServer())
      .delete(`/account/${account.id}`)
      .set({ 'Authorization': `Bearer ${managerAccount.token}` })
      .expect(204);

    await request(app.getHttpServer())
      .get(`/account/${account.id}`)
      .set({ 'Authorization': `Bearer ${managerAccount.token}` })
      .expect(404);

    expect(account).toBeDefined();
    expect(managerAccount).toBeDefined();
  });

  it('should return Forbidden exception when attempting to remove other account requested by customer | /account/:id (DELETE)', async() => {
    const account = await signUp(sampleAccount);
    const secondAccount = await signUp({ email: updatedEmail, password: updatedPassword, role: Roles.Customer });

    await request(app.getHttpServer())
      .delete(`/account/${account.id}`)
      .set({ 'Authorization': `Bearer ${secondAccount.token}` })
      .expect(403);

    await request(app.getHttpServer())
      .get(`/account/${account.id}`)
      .set({ 'Authorization': `Bearer ${account.token}` })
      .expect(200);

    expect(account).toBeDefined();
    expect(secondAccount).toBeDefined();
  });

  it('should return Forbidden exception when attempting to remove non-existing account requested by customer | /account/:id (DELETE)', async() => {
    const account = await signUp(sampleAccount);

    await request(app.getHttpServer())
      .delete(`/account/2`)
      .set({ 'Authorization': `Bearer ${account.token}` })
      .expect(403);

    expect(account).toBeDefined();
  });

  it('should return NotFound exception when attempting to remove non-existing account requested by manager | /account/:id (DELETE)', async() => {
    const account = await signUp({...sampleAccount, role: Roles.Manager });

    await request(app.getHttpServer())
      .delete(`/account/2`)
      .set({ 'Authorization': `Bearer ${account.token}` })
      .expect(404);

    expect(account).toBeDefined();
  });

  it('should return Unauthorized error when attempting to remove an account with invalid or missing token | /account/:id (DELETE)', async() => {
    const account = await signUp({...sampleAccount, role: Roles.Manager });

    await request(app.getHttpServer())
      .delete(`/account/${1}`)
      .expect(401);

    await request(app.getHttpServer())
      .delete(`/account/${1}`)
      .set({ "Authorization": `Bearer gibberishtext` })
      .expect(401);

    await request(app.getHttpServer())
      .get(`/account/${1}`)
      .set({ "Authorization": `Bearer ${account.token}` })
      .expect(200); 

    expect(account).toBeDefined();
  });
});
