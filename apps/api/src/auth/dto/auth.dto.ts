import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class SignUp {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsStrongPassword()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  organizationName!: string;
}
