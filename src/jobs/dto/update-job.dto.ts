import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { Status } from '../jobs.interface';

export class UpdateJobDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  data?: Record<string, any>;

  @IsString()
  @IsOptional()
  @IsIn(['ACTIVATED', 'DEACTIVATED'])
  status?: Status;

  @IsNumber()
  @IsOptional()
  scheduleTime?: number;
}
