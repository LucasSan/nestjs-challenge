export type Release = {
  id: string;
  title: string;
  date: string;
  country: string;
  status: string;
  statusId: string;
  packaging: string | null;
  packagingId: string | null;
  barcode: string | null;
  asin: string | null;
  quality: string;
  disambiguation: string;
  textRepresentation: {
    script: string;
    language: string;
  };
  releaseEvents: ReleaseEvent[];
  media: Media[];
  coverArtArchive: CoverArtArchive;
};

export type ReleaseEvent = {
  date: string;
  area: {
    id: string;
    name: string;
    'iso-3166-1-codes': string[];
    disambiguation: string;
    type: string | null;
    'type-id': string | null;
    'sort-name': string;
  };
};

export type Media = {
  position: number;
  title: string;
  format: string;
  formatId: string;
  trackCount: number;
  trackOffset: number;
  tracks: Track[];
};

export type Track = {
  id: string;
  title: string;
  number: string;
  length: number;
  position: number;
  recording: Recording;
};

export type Recording = {
  id: string;
  title: string;
  length: number;
  disambiguation: string;
  video: boolean;
  'first-release-date': string;
};

export type CoverArtArchive = {
  count: number;
  artwork: boolean;
  front: boolean;
  back: boolean;
  darkened: boolean;
};
