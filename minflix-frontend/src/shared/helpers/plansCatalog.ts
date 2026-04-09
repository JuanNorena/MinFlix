export interface PlanCatalogItem {
  code: 'BASICO' | 'ESTANDAR' | 'PREMIUM'
  title: string
  monthlyPrice: string
  profileLimit: string
  quality: string
  simultaneousDevices: string
  benefits: string[]
}

export const plansCatalog: PlanCatalogItem[] = [
  {
    code: 'BASICO',
    title: 'Plan Basico',
    monthlyPrice: '$14.900 COP',
    profileLimit: 'Hasta 2 perfiles',
    quality: 'HD',
    simultaneousDevices: '1 dispositivo',
    benefits: [
      'Acceso completo al catalogo principal',
      'Recomendaciones personalizadas por perfil',
      'Control parental por tipo de perfil',
    ],
  },
  {
    code: 'ESTANDAR',
    title: 'Plan Estandar',
    monthlyPrice: '$24.900 COP',
    profileLimit: 'Hasta 3 perfiles',
    quality: 'Full HD',
    simultaneousDevices: '2 dispositivos',
    benefits: [
      'Mejor calidad de reproduccion para series y peliculas',
      'Mas espacio para perfiles familiares',
      'Prioridad media en nuevas funciones de experiencia',
    ],
  },
  {
    code: 'PREMIUM',
    title: 'Plan Premium',
    monthlyPrice: '$34.900 COP',
    profileLimit: 'Hasta 5 perfiles',
    quality: '4K + HDR (cuando aplique)',
    simultaneousDevices: '4 dispositivos',
    benefits: [
      'Maxima calidad visual y experiencia inmersiva',
      'Capacidad alta para hogar y cuentas compartidas',
      'Prioridad en novedades y optimizaciones',
    ],
  },
]

export const profileHelperNotes = [
  'Perfil inicial: primer perfil de reproduccion que se crea al registrar la cuenta.',
  'Su objetivo es separar historial, recomendaciones y progreso de visualizacion por persona.',
  'Despues podras crear perfiles adicionales segun el limite de tu plan.',
]
