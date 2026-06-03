import { AuthController } from './auth.controller';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LoginRequestDto } from '../../application/dtos/login-request.dto';
import { LoginResponseDto } from '../../application/dtos/login-response.dto';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

describe('AuthController', () => {
  let controller: AuthController;
  let loginUseCase: jest.Mocked<LoginUseCase>;

  beforeEach(() => {
    loginUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<LoginUseCase>;
    controller = new AuthController(loginUseCase);
  });

  describe('login', () => {
    const dto: LoginRequestDto = { docNumber: '12345678', password: 'secret' };

    it('should return the result from LoginUseCase', async () => {
      const response = LoginResponseDto.create('signed.jwt.token');
      loginUseCase.execute.mockResolvedValue(response);

      const result = await controller.login(dto);

      expect(result).toBe(response);
    });

    it('should delegate to LoginUseCase with the received DTO', async () => {
      loginUseCase.execute.mockResolvedValue(LoginResponseDto.create('token'));

      await controller.login(dto);

      expect(loginUseCase.execute).toHaveBeenCalledWith(dto);
    });

    it('should propagate InvalidCredentialsException from LoginUseCase', async () => {
      loginUseCase.execute.mockRejectedValue(new InvalidCredentialsException());

      await expect(controller.login(dto)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });
});
