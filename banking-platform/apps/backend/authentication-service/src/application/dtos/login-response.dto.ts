export interface UserProfileDto {
  fullName: string;
  docType: string;
  docNumber: string;
}

export class LoginResponseDto {
  accessToken: string;
  user: UserProfileDto;

  static create(accessToken: string, user: UserProfileDto): LoginResponseDto {
    const dto = new LoginResponseDto();
    dto.accessToken = accessToken;
    dto.user = user;
    return dto;
  }
}
