import { Status } from './jobs.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as TypeSchema } from 'mongoose';
import { Agenda } from 'agenda/es';
import { JobAttributes } from 'agenda';

export type JobDocument = Job & Document;

@Schema({
  collation: { locale: 'en_US', strength: 1, caseLevel: true },
  timestamps: true,
})
class Job implements JobAttributes {
  @Prop({ index: true })
  name: string;

  @Prop({ type: TypeSchema.Types.Mixed })
  data: Record<string, any>;

  @Prop({ type: String, index: true, enum: ['ACTIVATED', 'DEACTIVATED'] })
  status: Status;

  @Prop({ type: Number })
  scheduleTime: number;
  agenda: Agenda;

  @Prop({ type: String })
  priority: number | string;

  @Prop({ type: String })
  type: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);
