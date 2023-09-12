import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from "fs";

async function genreFIX(genreList: string[]) {
  let data: string = "";
  for (let genre of genreList) {
    data += genre.replace("#", "") + "\n";
  }
  await fs.writeFileSync("/workspace/finding_restaurant/finding_rest/src/webtoons/crawling/genres/genreList.txt", data);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: true,//여기에 url을 넣어도된다. 
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    whitelist: true,
    forbidNonWhitelisted: true,
    enableDebugMessages: true,
  }));

  await app.listen(5000);
}
bootstrap();

//https://hwasurr.io/nestjs/caching/