import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 32 })
  totalItems!: number;

  @ApiProperty({ example: 4 })
  totalPages!: number;

  @ApiProperty({ example: true })
  hasNextPage!: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage!: boolean;
}

export type SuccessResponseMeta = PaginationMetaDto | null;

export class SuccessResponseDto<T = unknown> {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ example: 'Request successful' })
  message!: string;

  @ApiProperty({ example: '2026-05-06T08:15:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '/staffs' })
  path!: string;

  @ApiProperty({ nullable: true })
  data!: T;

  @ApiProperty({
    nullable: true,
    type: PaginationMetaDto,
    description: 'Optional metadata, used for paginated responses',
  })
  meta!: SuccessResponseMeta;
}
