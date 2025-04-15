import { Injectable } from '@nestjs/common';
import { IMusicBrainz } from './IMusicBrainz.interface';
import { request } from 'undici';
import { Release } from './dto';

@Injectable()
export class MusicBrainzService implements IMusicBrainz {
  async getReleaseData(mbid: string): Promise<Release> {
    const { body } = await request<Release>(
      `${process.env.MUSICBIZ_API_URL}/release/${mbid}?&inc=recordings&fmt=json`,
      {
        headers: {
          'User-Agent': 'nestjs-challenge/1.0.0 (lucas.germano@gmail.com)',
        },
      },
    );

    return (await body.json()) as Release;
  }
}
