import { Test, TestingModule } from '@nestjs/testing';
import { UserWebtoonController } from '../user-webtoon.controller';

describe('UserWebtoonController', () => {
  let controller: UserWebtoonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserWebtoonController],
    }).compile();

    controller = module.get<UserWebtoonController>(UserWebtoonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
