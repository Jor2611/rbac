import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateAccountDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  password: string;
}