import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrizesService } from './prizes.service';

@ApiTags('Prizes')
@Controller({ path: 'prizes', version: '1' })
export class PrizesController {
  constructor(private readonly prizesService: PrizesService) {}
}
