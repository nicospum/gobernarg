import type { ActionCategory } from '../types/game';
import { CATEGORY_ICONS, IMAGES } from '../utils/imageAssets';
import type { UiCategory } from './causal';

export interface CategoryStyle {
  /** Clase Tailwind para color de texto/foreground */
  color: string;
  /** Clase Tailwind para color de fondo */
  bgColor: string;
  /** Clase Tailwind para color de borde */
  borderColor: string;
  /** Ruta al ícono webp propio de la categoría */
  imageSrc: string;
  /** Etiqueta legible en español */
  label: string;
}

export const CATEGORY_STYLES: Record<ActionCategory, CategoryStyle> = {
  economia: {
    color: 'text-green-400',
    bgColor: 'bg-green-400/15',
    borderColor: 'border-green-400/40',
    imageSrc: CATEGORY_ICONS.economia,
    label: 'Economía',
  },
  social: {
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/15',
    borderColor: 'border-orange-400/40',
    imageSrc: CATEGORY_ICONS.social,
    label: 'Social',
  },
  infraestructura: {
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/15',
    borderColor: 'border-gray-400/40',
    imageSrc: CATEGORY_ICONS.infraestructura,
    label: 'Infraestructura',
  },
  diplomacia: {
    color: 'text-violet-400',
    bgColor: 'bg-violet-400/15',
    borderColor: 'border-violet-400/40',
    imageSrc: CATEGORY_ICONS.diplomacia,
    label: 'Diplomacia',
  },
  seguridad: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/15',
    borderColor: 'border-blue-400/40',
    imageSrc: CATEGORY_ICONS.seguridad,
    label: 'Seguridad',
  },
  cultura: {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/15',
    borderColor: 'border-yellow-400/40',
    imageSrc: CATEGORY_ICONS.cultura,
    label: 'Cultura',
  },
  educacion: {
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/15',
    borderColor: 'border-cyan-400/40',
    imageSrc: CATEGORY_ICONS.educacion,
    label: 'Educación',
  },
  turismo: {
    color: 'text-teal-400',
    bgColor: 'bg-teal-400/15',
    borderColor: 'border-teal-400/40',
    imageSrc: CATEGORY_ICONS.turismo,
    label: 'Turismo',
  },
  tecnologia: {
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-400/15',
    borderColor: 'border-indigo-400/40',
    imageSrc: CATEGORY_ICONS.tecnologia,
    label: 'Tecnología',
  },
};

/** Todas las categorías, en orden semántico */
export const ALL_CATEGORIES: ActionCategory[] = [
  'economia',
  'social',
  'infraestructura',
  'diplomacia',
  'seguridad',
  'cultura',
  'educacion',
  'turismo',
  'tecnologia',
];

/**
 * Estilos de las categorías de UI del catálogo nuevo (04_ACCIONES "Categoría UI").
 * Reutilizan los íconos y la paleta de las categorías del juego.
 */
export const UI_CATEGORY_STYLES: Record<UiCategory, CategoryStyle> = {
  'Economía y moneda': { ...CATEGORY_STYLES.economia, imageSrc: IMAGES.icons.categories.economy, label: 'Economía' },
  'Impuestos': { color: 'text-lime-400', bgColor: 'bg-lime-400/15', borderColor: 'border-lime-400/40', imageSrc: IMAGES.icons.categories.governmentCongress, label: 'Impuestos' },
  'Producción y trabajo': { color: 'text-amber-400', bgColor: 'bg-amber-400/15', borderColor: 'border-amber-400/40', imageSrc: IMAGES.icons.categories.economyGrowth, label: 'Producción' },
  'Social y salud': { ...CATEGORY_STYLES.social, label: 'Social' },
  'Educación, ciencia y cultura': { ...CATEGORY_STYLES.educacion, label: 'Educación' },
  'Infraestructura': { ...CATEGORY_STYLES.infraestructura, label: 'Obras' },
  'Seguridad y justicia': { ...CATEGORY_STYLES.seguridad, label: 'Seguridad' },
  'Instituciones y ambiente': { color: 'text-teal-400', bgColor: 'bg-teal-400/15', borderColor: 'border-teal-400/40', imageSrc: IMAGES.icons.categories.government, label: 'Instituciones' },
  'Exterior': { ...CATEGORY_STYLES.diplomacia, label: 'Exterior' },
  'Política y relaciones': { color: 'text-violet-400', bgColor: 'bg-violet-400/15', borderColor: 'border-violet-400/40', imageSrc: IMAGES.icons.categories.diplomacyHandshake, label: 'Política' },
};
