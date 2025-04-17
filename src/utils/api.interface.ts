import { Release } from './dto';

export interface IMusicBrainzService {
  getReleaseData: (mbid: string) => Promise<Release>;
}
