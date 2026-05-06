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
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: AuthStaffDto })
  staff!: AuthStaffDto;
}
