/**
 * Entidad de favoritos (`FAVORITOS`) por perfil para personalización de contenido.
 *
 * Permite que un perfil marque contenidos como favoritos para acceder
 * a ellos rápidamente desde su lista personal.
 *
 * @see {@link ProfileEntity} para el perfil que marca el favorito
 * @see {@link ContentEntity} para el contenido favorito
 * @see {@link CommunityService} para la gestión de favoritos
 */

/** Decoradores de columnas, relaciones, claves primarias y auditoría de TypeORM */
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Entidad de perfil de usuario */
import { ProfileEntity } from '../../auth/entities';

/** Entidad de contenido multimedia */
import { ContentEntity } from '../../catalog/entities';

/**
 * Entidad de favoritos por perfil para personalización de contenido.
 */
@Entity({ name: 'FAVORITOS' })
export class FavoriteEntity {
  /**
   * Identificador unico del registro favorito.
   */
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_FAVORITO',
  })
  id!: number;

  /**
   * Perfil que marca el contenido como favorito.
   */
  @ManyToOne(() => ProfileEntity, { nullable: false })
  @JoinColumn({ name: 'ID_PERFIL' })
  perfil!: ProfileEntity;

  /**
   * Contenido asociado al favorito.
   */
  @ManyToOne(() => ContentEntity, { nullable: false })
  @JoinColumn({ name: 'ID_CONTENIDO' })
  contenido!: ContentEntity;

  /**
   * Fecha de adicion del favorito.
   */
  @CreateDateColumn({
    type: 'timestamp',
    name: 'FECHA_ADICION',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaAdicion!: Date;
}
