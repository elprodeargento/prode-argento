import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InstagramService } from './instagram.service';

@ApiTags('Instagram')
@Controller({ path: 'instagram', version: '1' })
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}
}
