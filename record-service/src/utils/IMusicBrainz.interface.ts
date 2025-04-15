import { Release } from './dto';

export interface IMusicBrainz {
  getReleaseData: (mbid: string) => Promise<Release>;
}
