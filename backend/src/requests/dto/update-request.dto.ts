import { PartialType } from '@nestjs/mapped-types';

import { CreateRequestDto } from './create-request.dto.js';

export class UpdateRequestDto extends PartialType(CreateRequestDto) { }