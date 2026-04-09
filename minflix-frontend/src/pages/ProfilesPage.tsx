import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { apiClient } from '../shared/api/client'
import { profileInitials, resolveAvatarUrl } from '../shared/helpers/avatarUrl'
import { buttonClassName } from '../shared/ui/buttonStyles'

type ProfileType = 'adulto' | 'infantil'

interface AccountProfile {
  id: number
  nombre: string
  avatar: string | null
  tipoPerfil: ProfileType
}

interface ProfileFormState {
  nombre: string
  tipoPerfil: ProfileType
  avatar: string
}

interface UploadAvatarResponse {
  avatarUrl: string
}

/**
 * Gestiona perfiles de reproduccion asociados a la cuenta autenticada.
 */
export function ProfilesPage() {
  const [profiles, setProfiles] = useState<AccountProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const [isUploadingCreateAvatar, setIsUploadingCreateAvatar] = useState(false)
  const [isUploadingEditAvatar, setIsUploadingEditAvatar] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editingProfileId, setEditingProfileId] = useState<number | null>(null)
  const [createForm, setCreateForm] = useState<ProfileFormState>({
    nombre: '',
    tipoPerfil: 'adulto',
    avatar: '',
  })
  const [editForm, setEditForm] = useState<ProfileFormState>({
    nombre: '',
    tipoPerfil: 'adulto',
    avatar: '',
  })

  const profileSummary = useMemo(() => {
    const adults = profiles.filter((profile) => profile.tipoPerfil === 'adulto').length
    const kids = profiles.length - adults

    return {
      total: profiles.length,
      adults,
      kids,
    }
  }, [profiles])

  useEffect(() => {
    void fetchProfiles()
  }, [])

  /**
   * Consulta perfiles de la cuenta autenticada.
   */
  async function fetchProfiles() {
    try {
      setIsLoading(true)
      const response = await apiClient.get<AccountProfile[]>('/auth/profiles')
      const normalizedProfiles = response.data.map<AccountProfile>((profile) => ({
        ...profile,
        tipoPerfil: profile.tipoPerfil === 'infantil' ? 'infantil' : 'adulto',
      }))
      setProfiles(normalizedProfiles)
    } catch {
      toast.error('No fue posible cargar los perfiles de la cuenta.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Valida reglas de imagen para avatar antes de subir al backend.
   * @param file - Archivo seleccionado por el usuario.
   * @returns true cuando cumple reglas minimas.
   */
  function validateAvatarFile(file: File): boolean {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen para avatar.')
      return false
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar 5MB.')
      return false
    }

    return true
  }

  /**
   * Sube imagen de avatar al backend y retorna URL publica.
   * @param file - Archivo local de imagen.
   * @returns URL publica del avatar o null si falla la carga.
   */
  async function uploadAvatarFile(file: File): Promise<string | null> {
    if (!validateAvatarFile(file)) {
      return null
    }

    const payload = new FormData()
    payload.append('avatar', file)

    try {
      const response = await apiClient.post<UploadAvatarResponse>(
        '/auth/profiles/avatar',
        payload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      return response.data.avatarUrl
    } catch {
      toast.error('No fue posible cargar la imagen de avatar.')
      return null
    }
  }

  /**
   * Sube avatar para formulario de creacion.
   * @param event - Cambio del input file asociado al formulario de creacion.
   */
  async function handleCreateAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    try {
      setIsUploadingCreateAvatar(true)
      const avatarUrl = await uploadAvatarFile(selectedFile)
      if (avatarUrl) {
        setCreateForm((current) => ({ ...current, avatar: avatarUrl }))
        toast.success('Avatar cargado correctamente.')
      }
    } finally {
      setIsUploadingCreateAvatar(false)
      event.target.value = ''
    }
  }

  /**
   * Sube avatar para formulario de edicion.
   * @param event - Cambio del input file asociado al formulario de edicion.
   */
  async function handleEditAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile || editingProfileId === null) {
      return
    }

    try {
      setIsUploadingEditAvatar(true)
      const avatarUrl = await uploadAvatarFile(selectedFile)
      if (avatarUrl) {
        setEditForm((current) => ({ ...current, avatar: avatarUrl }))
        toast.success('Avatar para edicion cargado correctamente.')
      }
    } finally {
      setIsUploadingEditAvatar(false)
      event.target.value = ''
    }
  }

  /**
   * Crea un perfil adicional en la cuenta actual.
   * @param event - Evento submit del formulario.
   */
  async function handleCreateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!createForm.nombre.trim()) {
      toast.error('El nombre del perfil es obligatorio.')
      return
    }

    try {
      setIsCreatingProfile(true)
      await apiClient.post('/auth/profiles', {
        nombre: createForm.nombre.trim(),
        tipoPerfil: createForm.tipoPerfil,
        avatar: createForm.avatar.trim() || undefined,
      })

      setCreateForm({ nombre: '', tipoPerfil: 'adulto', avatar: '' })
      toast.success('Perfil creado correctamente.')
      await fetchProfiles()
    } catch {
      toast.error('No se pudo crear el perfil. Revisa el limite de tu plan.')
    } finally {
      setIsCreatingProfile(false)
    }
  }

  /**
   * Inicializa formulario de edicion desde un perfil existente.
   * @param profile - Perfil seleccionado para editar.
   */
  function startEditingProfile(profile: AccountProfile) {
    setEditingProfileId(profile.id)
    setEditForm({
      nombre: profile.nombre,
      tipoPerfil: profile.tipoPerfil,
      avatar: profile.avatar ?? '',
    })
  }

  /**
   * Cancela la edicion actual de perfil.
   */
  function cancelEditingProfile() {
    setEditingProfileId(null)
    setEditForm({ nombre: '', tipoPerfil: 'adulto', avatar: '' })
  }

  /**
   * Persiste los cambios del perfil que se encuentra en modo edicion.
   * @param profileId - Identificador del perfil editado.
   */
  async function handleSaveProfileEdit(profileId: number) {
    if (!editForm.nombre.trim()) {
      toast.error('El nombre del perfil es obligatorio para guardar cambios.')
      return
    }

    try {
      setIsSavingEdit(true)
      await apiClient.patch(`/auth/profiles/${profileId}`, {
        nombre: editForm.nombre.trim(),
        tipoPerfil: editForm.tipoPerfil,
        avatar: editForm.avatar.trim() || undefined,
      })

      toast.success('Perfil actualizado correctamente.')
      cancelEditingProfile()
      await fetchProfiles()
    } catch {
      toast.error('No se pudo actualizar el perfil.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  /**
   * Elimina un perfil de la cuenta actual.
   * @param profileId - Identificador del perfil a eliminar.
   */
  async function handleDeleteProfile(profileId: number) {
    try {
      await apiClient.delete(`/auth/profiles/${profileId}`)
      toast.success('Perfil eliminado correctamente.')
      if (editingProfileId === profileId) {
        cancelEditingProfile()
      }
      await fetchProfiles()
    } catch {
      toast.error('No se pudo eliminar el perfil. Debes conservar al menos uno.')
    }
  }

  const createAvatarUrl = resolveAvatarUrl(createForm.avatar)
  const editAvatarUrl = resolveAvatarUrl(editForm.avatar)

  return (
    <main className="nf-shell">
      <section className="nf-hero-wrap">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="nf-chip"
        >
          Cuenta · Gestion de perfiles
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="nf-hero-title"
        >
          Administra los perfiles de tu hogar.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.4 }}
          className="nf-hero-description"
        >
          Crea o elimina perfiles, y carga avatar desde tu computador para una experiencia estilo streaming.
        </motion.p>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
          className="nf-helper-panel"
        >
          <h2>Resumen de perfiles</h2>
          <ul>
            <li>Total: {profileSummary.total}</li>
            <li>Adultos: {profileSummary.adults}</li>
            <li>Infantiles: {profileSummary.kids}</li>
          </ul>
        </motion.section>

        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="nf-form"
          onSubmit={handleCreateProfile}
          style={{ marginTop: '1.5rem' }}
        >
          <label htmlFor="profileName">Nombre del perfil</label>
          <input
            id="profileName"
            type="text"
            className="nf-input"
            value={createForm.nombre}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, nombre: event.target.value }))
            }
            placeholder="Ejemplo: Camila"
          />

          <label htmlFor="profileType">Tipo de perfil</label>
          <select
            id="profileType"
            className="nf-input"
            value={createForm.tipoPerfil}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                tipoPerfil: event.target.value as ProfileType,
              }))
            }
          >
            <option value="adulto">Adulto</option>
            <option value="infantil">Infantil</option>
          </select>

          <label htmlFor="profileAvatar">Avatar (opcional)</label>
          <input
            id="profileAvatar"
            type="file"
            accept="image/*"
            className="nf-input"
            onChange={(event) => {
              void handleCreateAvatarUpload(event)
            }}
            disabled={isUploadingCreateAvatar}
          />
          <p className="nf-helper-field">
            Selecciona una imagen PNG, JPG o WEBP desde el explorador de archivos
            (maximo 5MB).
          </p>

          {createAvatarUrl ? (
            <div className="nf-avatar-upload-preview">
              <img src={createAvatarUrl} alt="Previsualizacion del avatar" />
              <button
                type="button"
                className={buttonClassName('ghost')}
                onClick={() =>
                  setCreateForm((current) => ({ ...current, avatar: '' }))
                }
              >
                Quitar avatar
              </button>
            </div>
          ) : null}

          <button
            type="submit"
            className={buttonClassName('primary')}
            disabled={isCreatingProfile || isUploadingCreateAvatar}
          >
            {isUploadingCreateAvatar
              ? 'Subiendo avatar...'
              : isCreatingProfile
                ? 'Creando perfil...'
                : 'Crear perfil'}
          </button>
        </motion.form>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.4 }}
          className="nf-feature-grid"
          style={{ marginTop: '1.5rem' }}
        >
          {isLoading ? (
            <article className="nf-feature-card">
              <h3>Cargando perfiles...</h3>
              <p>Estamos consultando la informacion de tu cuenta.</p>
            </article>
          ) : profiles.length === 0 ? (
            <article className="nf-feature-card">
              <h3>Sin perfiles</h3>
              <p>Agrega tu primer perfil para personalizar la experiencia.</p>
            </article>
          ) : (
            profiles.map((profile) => {
              const profileAvatarUrl = resolveAvatarUrl(profile.avatar)

              return (
                <article key={profile.id} className="nf-feature-card">
                  <header className="nf-profile-card-head">
                    {profileAvatarUrl ? (
                      <img
                        src={profileAvatarUrl}
                        alt={`Avatar de ${profile.nombre}`}
                        className="nf-profile-card-avatar"
                      />
                    ) : (
                      <span className="nf-profile-card-avatar nf-profile-card-avatar-fallback">
                        {profileInitials(profile.nombre)}
                      </span>
                    )}
                    <h3>{profile.nombre}</h3>
                  </header>

                  {editingProfileId === profile.id ? (
                    <div className="nf-profile-edit-form">
                      <label htmlFor={`editName-${profile.id}`}>Nombre</label>
                      <input
                        id={`editName-${profile.id}`}
                        type="text"
                        className="nf-input"
                        value={editForm.nombre}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            nombre: event.target.value,
                          }))
                        }
                      />

                      <label htmlFor={`editType-${profile.id}`}>Tipo de perfil</label>
                      <select
                        id={`editType-${profile.id}`}
                        className="nf-input"
                        value={editForm.tipoPerfil}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            tipoPerfil: event.target.value as ProfileType,
                          }))
                        }
                      >
                        <option value="adulto">Adulto</option>
                        <option value="infantil">Infantil</option>
                      </select>

                      <label htmlFor={`editAvatar-${profile.id}`}>Avatar</label>
                      <input
                        id={`editAvatar-${profile.id}`}
                        type="file"
                        accept="image/*"
                        className="nf-input"
                        onChange={(event) => {
                          void handleEditAvatarUpload(event)
                        }}
                        disabled={isUploadingEditAvatar}
                      />

                      {editAvatarUrl ? (
                        <div className="nf-avatar-upload-preview">
                          <img src={editAvatarUrl} alt="Avatar en edicion" />
                          <button
                            type="button"
                            className={buttonClassName('ghost')}
                            onClick={() =>
                              setEditForm((current) => ({ ...current, avatar: '' }))
                            }
                          >
                            Quitar avatar
                          </button>
                        </div>
                      ) : null}

                      <div className="nf-profile-card-actions">
                        <button
                          type="button"
                          className={buttonClassName('primary')}
                          disabled={isSavingEdit || isUploadingEditAvatar}
                          onClick={() => void handleSaveProfileEdit(profile.id)}
                        >
                          {isSavingEdit ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                        <button
                          type="button"
                          className={buttonClassName('ghost')}
                          onClick={cancelEditingProfile}
                          disabled={isSavingEdit}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p>Tipo: {profile.tipoPerfil}</p>
                      <p>Avatar: {profile.avatar ? 'Configurado' : 'No asignado'}</p>
                      <div className="nf-profile-card-actions">
                        <button
                          type="button"
                          className={buttonClassName('ghost')}
                          onClick={() => startEditingProfile(profile)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={buttonClassName('ghost')}
                          onClick={() => void handleDeleteProfile(profile.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </article>
              )
            })
          )}
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.4 }}
          className="nf-hero-actions"
        >
          <Link to="/profiles/select" className={buttonClassName('ghost')}>
            Volver al selector
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
