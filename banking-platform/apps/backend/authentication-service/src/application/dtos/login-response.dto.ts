export class LoginResponseDto {
  accessToken: string;

  static create(accessToken: string): LoginResponseDto {
    const dto = new LoginResponseDto();
    dto.accessToken = accessToken;
    return dto;
  }
}
