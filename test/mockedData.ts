import { Roles } from "../src/account/constants/rolePermissions";

export const mockAccount = {
  id: 1,
  fakeId: 123456789, 
  email:'test@test.com',
  updatedEmail: 'updated@test.com', 
  password: 'asd123', 
  updatedPassword: 'updated123',
  role: Roles.Customer,
  token: 'thisistoken'
};