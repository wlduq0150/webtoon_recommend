import { Controller, Get } from '@nestjs/common';
import { DataManagerService } from './data_manager.service';

@Controller('data-manager')
export class DataManagerController {
    constructor(private readonly dataManager: DataManagerService) {}

    @Get("test")
    test() {
        this.dataManager.updateEmbedding();
    }

    
}
