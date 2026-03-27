import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

/**
 * Controlador de autenticacion con Passport.js.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Inicia sesion con estrategia local y retorna JWT.
   * @param _loginDto - Credenciales de entrada.
   * @param req - Request con usuario inyectado por Passport.
   * @returns Token de acceso y perfil basico.
   */
  @ApiOperation({ summary: 'Iniciar sesion con Passport local + JWT' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @Body() _loginDto: LoginDto,
    @Req() req: { user: { userId: number; email: string; role: string } },
  ) {
    return this.authService.login(req.user);
  }

  /**
   * Registra una cuenta principal y crea un perfil inicial.
   * @param registerDto - Datos de registro.
   * @returns Token de acceso y datos basicos de la cuenta creada.
   */
  @ApiOperation({ summary: 'Registrar cuenta principal en Oracle' })
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Retorna la identidad autenticada desde el token.
   * @param req - Request autenticado.
   * @returns Datos basicos del usuario autenticado.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar identidad autenticada' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(
    @Req() req: { user: { userId: number; email: string; role: string } },
  ) {
    return req.user;
  }
}
