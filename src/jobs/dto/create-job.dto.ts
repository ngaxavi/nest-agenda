import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { Status } from '../jobs.interface';

export class CreateJobDto {
  @IsString()
  name: string;

  @IsOptional()
  data: Record<string, any>;

  @IsString()
  @IsOptional()
  @IsIn(['ACTIVATED', 'DEACTIVATED'])
  status: Status;

  @IsNumber()
  scheduleTime: number;
}
