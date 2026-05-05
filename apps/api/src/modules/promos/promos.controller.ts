import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PromosService } from './promos.service';

@ApiTags('Promos')
@Controller({ path: 'promos', version: '1' })
export class PromosController {
  constructor(private readonly promosService: PromosService) {}
}
