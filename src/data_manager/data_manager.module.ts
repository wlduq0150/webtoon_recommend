import { Module } from '@nestjs/common';
import { RecommendModule } from 'src/recommend/recommend.module';
import { RecommendService } from 'src/recommend/recommend.service';
import { DataManagerService } from './data_manager.service';
import { DataManagerController } from './data_manager.controller';

@Module({
    imports: [
        RecommendModule,
    ],
    providers: [DataManagerService],
    controllers: [DataManagerController]
})
export class DataManagerModule {
    constructor(private dataService: DataManagerService, private recommend: RecommendService) {}
}