import { Test, TestingModule } from '@nestjs/testing';
import { RecordService } from './record.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Record } from '../schemas/record.schema';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';
import { RecordCategory, RecordFormat } from '../schemas/record.enum';
import { MusicBrainzService } from 'src/utils/api';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockRecordModel = {
  create: jest.fn(),
  findById: jest.fn(),
  updateOne: jest.fn(),
  find: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  exec: jest.fn(),
  countDocuments: jest.fn(),
};

const mockMusicBrainzService = {
  getReleaseData: jest.fn(),
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('RecordService', () => {
  let service: RecordService;
  let recordModel: Model<Record>;
  let musicBrainzService: MusicBrainzService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordService,
        { provide: getModelToken('Record'), useValue: mockRecordModel },
        { provide: MusicBrainzService, useValue: mockMusicBrainzService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<RecordService>(RecordService);
    recordModel = module.get<Model<Record>>(getModelToken('Record'));
    musicBrainzService = module.get<MusicBrainzService>(MusicBrainzService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a record without MBID', async () => {
      const dto: CreateRecordRequestDTO = {
        artist: 'Artist',
        album: 'Album',
        price: 10,
        qty: 1,
        format: RecordFormat.CD,
        category: RecordCategory.POP,
      };

      const createdRecord = { _id: '1', ...dto };
      mockRecordModel.create.mockResolvedValue(createdRecord);

      const result = await service.create(dto);
      expect(result).toEqual(createdRecord);
      expect(recordModel.create).toHaveBeenCalledWith(dto);
      expect(musicBrainzService.getReleaseData).toHaveBeenCalledTimes(0);
    });

    it('should enrich and create a record with MBID', async () => {
      const dto: CreateRecordRequestDTO = {
        artist: 'Artist',
        album: 'Album',
        price: 10,
        qty: 1,
        format: RecordFormat.VINYL,
        category: RecordCategory.ROCK,
        mbid: '123',
      };

      const mockTracks = [
        {
          recording: {
            id: 'track1',
            title: 'Track 1',
            length: 300000,
            disambiguation: '',
            video: false,
            'first-release-date': '2020-01-01',
          },
        },
      ];

      mockMusicBrainzService.getReleaseData.mockResolvedValue({
        media: [{ tracks: mockTracks }],
      });

      mockRecordModel.create.mockResolvedValue({ _id: '1', ...dto });

      const result = await service.create(dto);
      expect(recordModel.create).toHaveBeenCalled();
      expect(musicBrainzService.getReleaseData).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('_id');
    });
  });

  describe('update', () => {
    it('should update a record with new MBID', async () => {
      const mockRecord = {
        _id: '1',
        mbid: 'old-mbid',
        artist: 'Artist',
        album: 'Album',
      };

      const updateDto: UpdateRecordRequestDTO = {
        mbid: 'new-mbid',
        artist: 'Artist',
        album: 'Album',
      };

      mockRecordModel.findById.mockResolvedValue(mockRecord);
      mockMusicBrainzService.getReleaseData.mockResolvedValue({
        media: [{ tracks: [] }],
      });
      mockRecordModel.updateOne.mockResolvedValue({ acknowledged: true });

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockRecord);
      expect(musicBrainzService.getReleaseData).toHaveBeenCalledTimes(2);
    });
  });

  describe('findAll', () => {
    it('should return cached result if present', async () => {
      const cachedResult = { data: [], total: 0 };
      mockCacheManager.get.mockResolvedValueOnce(cachedResult);

      const result = await service.findAll({ limit: 10, offset: 0 });
      expect(result).toEqual(cachedResult);
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(recordModel.find).not.toHaveBeenCalled();
    });

    it('should query DB and set cache if no cached result', async () => {
      mockCacheManager.get.mockResolvedValueOnce(null);
      const mockRecords = [
        {
          artist: 'A',
          album: 'B',
          category: RecordCategory.ROCK,
          format: RecordFormat.VINYL,
        },
      ];

      mockRecordModel.exec.mockResolvedValue(mockRecords);
      mockRecordModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll({
        limit: 10,
        offset: 0,
        q: 'A',
        artist: undefined,
        album: undefined,
        format: RecordFormat.VINYL,
        category: RecordCategory.ROCK,
      });

      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalled();
      expect(result.data).toEqual(mockRecords);
      expect(result.total).toEqual(1);
    });
  });
});
