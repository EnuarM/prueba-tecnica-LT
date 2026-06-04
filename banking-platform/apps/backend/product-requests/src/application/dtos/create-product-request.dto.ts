import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductRequestDto {
  @IsString()
  @IsNotEmpty()
  clientDocNumber: string;

  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  productType: string;
}
