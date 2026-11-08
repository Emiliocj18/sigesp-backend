import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

// Parámetros opcionales de paginación para los listados del tenant (B6).
export class PaginacionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
