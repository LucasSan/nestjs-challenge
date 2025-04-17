import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';
import { RecordCategory, RecordFormat } from '../schemas/record.enum';
import { Record } from '../schemas/record.schema';

export interface IRecordService {
  create(payload: CreateRecordRequestDTO): Promise<Record>;
  update(id: string, payload: UpdateRecordRequestDTO): Promise<Record>;
  findById(id: string): Promise<Record>;
  findAll(
    filter: FilterRecordService,
  ): Promise<{ data: Record[]; total: number }>;
  checkRecordAvailability(payload: CreateOrderRequestDTO): Promise<boolean>;
}

export type FilterRecordService = {
  limit: number;
  offset: number;
  q?: string;
  artist?: string;
  album?: string;
  format?: RecordFormat;
  category?: RecordCategory;
};
