import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { extname, join } from 'node:path';
import { diskStorage } from 'multer';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

const avatarUploadStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'avatars'),
  filename: (_req, file, callback) => {
    const extension = extname(file.originalname).toLowerCase() || '.png';
    callback(null, `${randomUUID()}${extension}`);
  },
});

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

  /**
   * Lista los perfiles de la cuenta autenticada.
   * @param req - Request autenticado.
   * @returns Coleccion de perfiles de la cuenta.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar perfiles de la cuenta autenticada' })
  @UseGuards(JwtAuthGuard)
  @Get('profiles')
  listProfiles(
    @Req() req: { user: { userId: number; email: string; role: string } },
  ) {
    return this.authService.listProfiles(req.user.userId);
  }

  /**
   * Crea un nuevo perfil para la cuenta autenticada.
   * @param req - Request autenticado.
   * @param createProfileDto - Datos del nuevo perfil.
   * @returns Perfil creado.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear perfil de reproduccion' })
  @UseGuards(JwtAuthGuard)
  @Post('profiles')
  createProfile(
    @Req() req: { user: { userId: number; email: string; role: string } },
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.authService.createProfile(req.user.userId, createProfileDto);
  }

  /**
   * Carga imagen de avatar desde archivo local y retorna URL publica.
   * @param req - Request autenticado para resolver host de respuesta.
   * @param file - Archivo binario recibido por multipart/form-data.
   * @returns Ruta publica del avatar cargado.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subir avatar de perfil desde archivo local' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['avatar'],
    },
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: avatarUploadStorage,
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(
            new BadRequestException(
              'Solo se permiten archivos de imagen para el avatar',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  @Post('profiles/avatar')
  uploadAvatar(
    @Req()
    req: Request & { user: { userId: number; email: string; role: string } },
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Debes seleccionar una imagen valida');
    }

    return this.authService.resolveAvatarAsset(req, file.filename);
  }

  /**
   * Actualiza datos de un perfil perteneciente a la cuenta autenticada.
   * @param req - Request autenticado.
   * @param profileId - Identificador numerico del perfil.
   * @param updateProfileDto - Campos a actualizar del perfil.
   * @returns Perfil actualizado.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil de reproduccion' })
  @UseGuards(JwtAuthGuard)
  @Patch('profiles/:profileId')
  updateProfile(
    @Req() req: { user: { userId: number; email: string; role: string } },
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(
      req.user.userId,
      profileId,
      updateProfileDto,
    );
  }

  /**
   * Elimina un perfil de la cuenta autenticada.
   * @param req - Request autenticado.
   * @param profileId - Identificador numerico del perfil.
   * @returns Confirmacion de eliminacion.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar perfil de reproduccion' })
  @UseGuards(JwtAuthGuard)
  @Delete('profiles/:profileId')
  deleteProfile(
    @Req() req: { user: { userId: number; email: string; role: string } },
    @Param('profileId', ParseIntPipe) profileId: number,
  ) {
    return this.authService.deleteProfile(req.user.userId, profileId);
  }
}
