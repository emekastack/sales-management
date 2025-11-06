import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateSaleDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
