import { Test, TestingModule } from '@nestjs/testing';
import { RecordController } from './record.controller';
import { RecordService } from '../services/record.service';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { RecordFormat, RecordCategory } from '../schemas/record.enum';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';

describe('RecordController', () => {
  let controller: RecordController;
  let service: RecordService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordController],
      providers: [{ provide: RecordService, useValue: mockService }],
    }).compile();

    controller = module.get<RecordController>(RecordController);
    service = module.get<RecordService>(RecordService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return result', async () => {
      const dto: CreateRecordRequestDTO = {
        artist: 'Radiohead',
        album: 'OK Computer',
        price: 50,
        qty: 5,
        format: RecordFormat.VINYL,
        category: RecordCategory.ROCK,
        mbid: 'some-mbid',
      };

      const createdRecord = { id: '1', ...dto };
      mockService.create.mockResolvedValue(createdRecord);

      const result = await controller.create(dto);
      expect(result).toEqual(createdRecord);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return result', async () => {
      const records = [{ artist: 'Radiohead', album: 'Kid A' }];
      mockService.findAll.mockResolvedValue(records);

      const result = await controller.findAll(10, 0);
      expect(result).toEqual(records);
      expect(service.findAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        q: undefined,
        artist: undefined,
        album: undefined,
        format: undefined,
        category: undefined,
      });
    });
  });

  describe('update', () => {
    it('should call service.update and return result', async () => {
      const id = 'abc123';
      const dto: UpdateRecordRequestDTO = {
        artist: 'Updated Artist',
        album: 'Updated Album',
        mbid: 'updated-mbid',
      };

      const updatedRecord = { id, ...dto };
      mockService.update.mockResolvedValue(updatedRecord);

      const result = await controller.update(id, dto);
      expect(result).toEqual(updatedRecord);
      expect(service.update).toHaveBeenCalledWith(id, dto);
    });
  });
});
