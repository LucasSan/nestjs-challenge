import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { Record } from '../schemas/record.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';
import { MusicBrainzService } from 'src/utils/api';
import { Track } from 'src/utils/dto';
import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';
import { TrackListDTO } from '../dtos/track-list.request.dto';
import {
  FilterRecordService,
  IRecordService,
} from '../interfaces/record.service.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RecordService implements IRecordService {
  constructor(
    @InjectModel('Record') private readonly recordModel: Model<Record>,
    private readonly musicBrainzService: MusicBrainzService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(payload: CreateRecordRequestDTO): Promise<Record> {
    try {
      const recordData = { ...payload };

      if (payload.mbid) {
        const release = await this.musicBrainzService.getReleaseData(
          payload.mbid,
        );
        if (release) {
          const tracks = release?.media?.[0]?.tracks;
          recordData.trackList = this.enrichPayload(tracks);
        }
      }

      return this.recordModel.create(recordData);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating record: ${error.message}`,
      );
    }
  }

  async update(id: string, payload: UpdateRecordRequestDTO): Promise<Record> {
    try {
      const record = await this.recordModel.findById(id);
      if (!record) {
        throw new BadRequestException('Record not found');
      }

      if (payload.mbid && payload.mbid !== record.mbid) {
        const release = await this.musicBrainzService.getReleaseData(
          payload.mbid,
        );
        if (release) {
          const tracks = release?.media?.[0]?.tracks;
          payload.trackList = this.enrichPayload(tracks);
        }
      }

      const model = Object.assign(record, payload);
      const updated = await this.recordModel.updateOne(model);

      if (!updated) {
        throw new BadRequestException('Failed to update record');
      }

      return record;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error updating record: ${error.message}`,
      );
    }
  }

  async findById(id: string): Promise<Record> {
    try {
      const record = await this.recordModel.findById(id);
      if (!record) {
        throw new BadRequestException('Record not found');
      }
      return record;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding record: ${error.message}`,
      );
    }
  }

  async checkRecordAvailability(
    payload: CreateOrderRequestDTO,
  ): Promise<boolean> {
    try {
      const record = await this.findById(payload.recordId);
      return record.qty >= payload.qty;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error checking record availability: ${error.message}`,
      );
    }
  }

  async findAll(
    filter: FilterRecordService,
  ): Promise<{ data: Record[]; total: number }> {
    const { limit, offset, q, artist, album, format, category } = filter;
    const query: any = {};

    const cacheKey = `records:${limit}:${offset}:${q}:${artist}:${album}:${format}:${category}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as { data: Record[]; total: number };
    }

    if (q) {
      query.$or = [
        { artist: { $regex: q, $options: 'i' } },
        { album: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    if (artist) query.artist = { $regex: artist, $options: 'i' };
    if (album) query.album = { $regex: album, $options: 'i' };
    if (format) query.format = format;
    if (category) query.category = category;

    const result = await this.recordModel
      .find(query)
      .limit(limit)
      .skip(offset)
      .exec();

    const count = await this.recordModel.countDocuments(query);
    await this.cacheManager.set(cacheKey, result);
    return {
      data: result,
      total: count,
    };
  }

  private enrichPayload(tracks: Track[]): TrackListDTO[] {
    if (!tracks?.length) return [];
    return tracks.map((track) => {
      const { id, title, length, disambiguation, video } = track.recording;
      return {
        id,
        title,
        length,
        disambiguation,
        video,
        firstReleaseDate: track.recording['first-release-date'],
      };
    });
  }
}
