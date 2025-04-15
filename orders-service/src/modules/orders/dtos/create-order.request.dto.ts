import { IsString, IsNotEmpty, Min, Max, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderRequestDTO {
  @ApiProperty({
    description: 'Record Id',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  recordId: string;

  @ApiProperty({
    description: 'Quantity of the records',
    type: Number,
    example: 1000,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  qty: number;
}
