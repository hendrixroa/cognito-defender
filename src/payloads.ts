import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { IsUsername } from './custom.validator';

export class UserSignInPayload {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty()
  public password: string;
}

export enum UserRole {
  user = 'User',
  admin = 'Admin',
  finance = 'Finance',
}

export class UserSignUpPayload {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty()
  public password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsUsername()
  username: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  sshPublicKey?: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  @ApiProperty({ enum: ['User', 'Finance', 'Admin'] })
  role: UserRole;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: `https://your-name-bucket.s3.amazonaws.com/sample-avatar.png`,
  })
  avatar: string;
}

export class UserVerifyCodePayload {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  code: string;
}

export class UserResendCodePayload {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
}

export class RefreshTokenPayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  refreshToken: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;
}

export class ForgotPasswordPayload {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;
}

export class ConfirmPasswordPayload {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  code: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty()
  password: string;
}

export interface SignUpResponse {
  message: string;
}

export class SignInResponse {
  @ApiProperty()
  token: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  mfa: boolean;
}

export interface VerifyCodeResponse {
  message: string;
}

export class RefreshTokenResult {
  token: string;
}

export class PayloadJWTDecoded {
  @IsString()
  public uuid: string;

  @IsString()
  public email: string;

  @IsString()
  @IsUsername()
  public username: string;

  @IsBoolean()
  public emailVerified: string;

  @IsString()
  public cognitoId: string;

  @IsString()
  public role: string;

  @IsString()
  public eventId: string;
}

