import { ApiProperty } from '@nestjs/swagger';

class AuthStaffDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Nguyễn Văn An' })
  fullName!: string;

  @ApiProperty({ example: 'an@company.local' })
  email!: string;

  @ApiProperty({ example: 'STAFF' })
  role!: string;

  @ApiProperty({ example: 12 })
  leaveCredit!: number;
}

export class AuthResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJTVEFGRiIsImlhdCI6MTc3ODEyMzQ1NiwiZXhwIjoxNzc4MjA5ODU2fQ.r5S5O7w8b7yQmY8qkH3l1k6Qq1mYF9yX9v1k2a3b4c5',
  })
  accessToken!: string;

  @ApiProperty({ type: AuthStaffDto })
  staff!: AuthStaffDto;
}
