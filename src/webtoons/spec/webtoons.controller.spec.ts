import { Test, TestingModule } from '@nestjs/testing';
import { WebtoonsController } from './webtoons.controller';

describe('WebtoonsController', () => {
  let controller: WebtoonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebtoonsController],
    }).compile();

    controller = module.get<WebtoonsController>(WebtoonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
