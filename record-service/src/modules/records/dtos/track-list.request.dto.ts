import { ApiProperty } from '@nestjs/swagger';

export class TrackListDTO {
  @ApiProperty({
    description: 'Musicbrainz track id',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Musicbrainz track title',
    type: String,
  })
  title?: string;

  @ApiProperty({
    description: 'Musicbrainz track first release date',
    type: String,
  })
  firstReleaseDate: string;

  @ApiProperty({
    description: 'Musicbrainz track disambiguation',
    type: String,
  })
  disambiguation: string;

  @ApiProperty({
    description: 'Musicbrainz track video flag',
    type: Boolean,
  })
  video: boolean;

  @ApiProperty({
    description: 'Musicbrainz track length',
    type: Number,
  })
  length: number;
}
