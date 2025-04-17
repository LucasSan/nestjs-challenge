import { MusicBrainzService } from 'src/utils/api';
import { request } from 'undici';

jest.mock('undici', () => ({
  request: jest.fn(),
}));

describe('MusicBrainzService', () => {
  let service: MusicBrainzService;

  beforeEach(() => {
    service = new MusicBrainzService();
  });

  it('should fetch release data using undici request', async () => {
    const mockMbid = 'abc123';
    const mockResponse = { media: [], title: 'Test Album', id: mockMbid };
    const mockBody = {
      json: jest.fn().mockResolvedValue(mockResponse),
    };

    (request as jest.Mock).mockResolvedValue({ body: mockBody });

    const result = await service.getReleaseData(mockMbid);

    expect(request).toHaveBeenCalledWith(
      expect.stringContaining(mockMbid),
      expect.objectContaining({ headers: expect.any(Object) }),
    );
    expect(result).toEqual(mockResponse);
  });
});
