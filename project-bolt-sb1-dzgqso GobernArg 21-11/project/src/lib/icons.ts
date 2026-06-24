import {
  DollarSign,
  Heart,
  Building2,
  Globe,
  Shield,
  Star,
  GraduationCap,
  Plane,
  Cpu,
  type LucideIcon,
} from 'lucide-react';
import type { ActionCategory } from '@/types/game';

export const CATEGORY_LABELS: Record<ActionCategory, string> = {
  economia: 'Economía',
  social: 'Social',
  infraestructura: 'Infraestructura',
  diplomacia: 'Diplomacia',
  seguridad: 'Seguridad',
  cultura: 'Cultura',
  educacion: 'Educación',
  turismo: 'Turismo',
  tecnologia: 'Tecnología',
};

export const CATEGORY_ICONS: Record<ActionCategory, LucideIcon> = {
  economia: DollarSign,
  social: Heart,
  infraestructura: Building2,
  diplomacia: Globe,
  seguridad: Shield,
  cultura: Star,
  educacion: GraduationCap,
  turismo: Plane,
  tecnologia: Cpu,
};

/** Categorías principales que aparecen como tabs en el panel de acciones */
export const PRIMARY_CATEGORIES: ActionCategory[] = [
  'economia',
  'social',
  'infraestructura',
  'diplomacia',
  'seguridad',
  'cultura',
];
