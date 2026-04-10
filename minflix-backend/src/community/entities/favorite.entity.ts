import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProfileEntity } from '../../auth/entities';
import { ContentEntity } from '../../catalog/entities';

/**
 * Entidad de favoritos por perfil para personalizacion de contenido.
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
