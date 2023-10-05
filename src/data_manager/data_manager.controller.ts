import { Controller, Get, Patch } from '@nestjs/common';
import { DataManagerService } from './data_manager.service';

@Controller('data-manager')
export class DataManagerController {
    constructor(private readonly dataManager: DataManagerService) {}

    @Get("/test")
    test() {
        // this.dataManager.updateWebtoonGenre({
        //     genreCount: 4,
        //     service: "kakao",
        //     category: "판타지",
        // });

        // this.dataManager.updateWebtoonGenre_3_5({
        //     genreCount: 4,
        //     category: "판타지",
        //     descriptionLength: 300,
        // });

        this.dataManager.test();
    }

    @Get("/categoryKeyword")
    getAllCategory() {
        return this.dataManager.getAllCategoryKeyword();
    }

    @Get("/genreKeyword")
    getAllGenre() {
        return this.dataManager.getAllGenreKeyword();
    }

    @Patch("/newWeeklyWebtoon")
    loadingWeeklyWebtoon() {
        this.dataManager.loadingWeeklyWebtoon();
    }

    @Patch("/newFinishedWebtoon")
    loadingFinishedWebtoon() {
        this.dataManager.loadingFinishedWebtoon();
    }

    @Patch("/updateday")
    updateDay() {
        this.dataManager.updateDay();
    }

    @Patch("/updateEpisodeLength")
    updateWeeklyEpisodeLength() {
        this.dataManager.updateWeeklyEpisodeLength();
    }

    @Patch("/updateCategoryIsNull")
    updateWebtoonCategoryIsNull() {
        this.dataManager.updateWebtoonCategoryIsNull();
    }
}
