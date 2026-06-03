import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  @IsNotEmpty()
  docNumber: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
