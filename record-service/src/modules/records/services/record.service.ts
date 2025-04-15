import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { Record } from '../schemas/record.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';
import { RecordCategory, RecordFormat } from '../schemas/record.enum';
import { MusicBrainzService } from 'src/utils/api';
import { Track } from 'src/utils/dto';
import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';
import { TrackListDTO } from '../dtos/track-list.request.dto';

@Injectable()
export class RecordService {
  constructor(
    @InjectModel('Record') private readonly recordModel: Model<Record>,
    private readonly musicBrainzService: MusicBrainzService,
  ) {}

  async handleOrderPlaced(payload: CreateOrderRequestDTO): Promise<Record> {
    try {
      const record = await this.recordModel.findById(payload.recordId);
      if (!record) {
        throw new InternalServerErrorException('Record not found');
      }
      if (record.qty - payload.qty < 0) {
        throw new InternalServerErrorException('Sorry! Not enough stock');
      }

      const updated = await this.recordModel.updateOne({
        ...record,
        qty: payload.qty,
      });
      if (!updated) {
        throw new InternalServerErrorException('Failed to update record');
      }

      return record;
    } catch (error) {
      throw new Error(`Error updating record: ${error.message}`);
    }
  }

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
      throw new Error(`Error creating record: ${error.message}`);
    }
  }

  async update(id: string, payload: UpdateRecordRequestDTO): Promise<Record> {
    try {
      const record = await this.recordModel.findById(id);
      if (!record) {
        throw new InternalServerErrorException('Record not found');
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

      const updated = await this.recordModel.updateOne({
        ...record,
        ...payload,
      });

      if (!updated) {
        throw new InternalServerErrorException('Failed to update record');
      }

      return record;
    } catch (error) {
      throw new Error(`Error updating record: ${error.message}`);
    }
  }

  async findAll(
    limit: number = 10,
    skip: number = 0,
    q?: string,
    artist?: string,
    album?: string,
    format?: RecordFormat,
    category?: RecordCategory,
  ): Promise<Record[]> {
    const query: any = {};

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

    return this.recordModel.find(query).limit(limit).skip(skip).exec();
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
