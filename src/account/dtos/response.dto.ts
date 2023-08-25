import { Expose } from "class-transformer";
import { Roles } from "../constants/rolePermissions";

export class ResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  token: string;

  @Expose()
  role: Roles;
}