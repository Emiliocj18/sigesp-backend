import { IsString, IsNotEmpty } from 'class-validator';

// DTO para los endpoints /auth/refresh y /auth/logout
export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
