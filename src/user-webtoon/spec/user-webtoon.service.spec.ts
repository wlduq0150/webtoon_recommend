import { Test, TestingModule } from '@nestjs/testing';
import { UserWebtoonService } from './user-webtoon.service';

describe('UserWebtoonService', () => {
  let service: UserWebtoonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserWebtoonService],
    }).compile();

    service = module.get<UserWebtoonService>(UserWebtoonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
