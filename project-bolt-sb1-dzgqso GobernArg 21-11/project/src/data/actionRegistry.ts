import {
  AlertCircle,
  BadgeDollarSign,
  Banknote,
  BookOpen,
  Brush,
  Building,
  Building2,
  Bus,
  Calculator,
  Camera,
  CircleDollarSign,
  ClipboardList,
  Construction,
  Cpu,
  Droplet,
  Factory,
  Flame,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  Landmark,
  Laptop,
  Leaf,
  Library,
  Lightbulb,
  LineChart,
  Music,
  Palette,
  Plane,
  Receipt,
  Scale,
  Shield,
  ShieldCheck,
  Sun,
  TreePine,
  TrendingDown,
  TrendingUp,
  Users,
  Users2,
  Utensils,
  Wifi
} from 'lucide-react';
import type { GameAction } from '../types/game';

export interface ActionDefinition extends GameAction {
  affectedGroups: {
    supports: string[];
    opposes: string[];
  };
  triggersEvent?: string;
  satisfiesDemand?: string[];
}

export const actionDefinitions: ActionDefinition[] = [
  // =====================
  // ECONOMÍA
  // =====================
  {
    id: 'emitir_dinero',
    title: 'Emitir Dinero',
    description: 'Aumentar la masa monetaria para financiar gastos',
    icon: Banknote,
    popularityChange: 3,
    budgetChange: 150,
    category: 'economia',
    requirements: { minBudget: 0 },
    availableForPositions: ['presidente'],
    cooldown: 4,
    diminishingFactor: 0.65,
    multiEffects: {
      stabilityChange: -3,
      legitimacyChange: -5,
      votingIntentionChange: -2
    },
    affectedGroups: {
      supports: ['sectores-populares', 'sindicatos'],
      opposes: ['empresarios', 'sector-financiero', 'clase-alta']
    }
  },
  {
    id: 'mejorar_recaudacion',
    title: 'Mejorar Recaudación',
    description: 'Optimizar el sistema de recaudación de impuestos',
    icon: Receipt,
    popularityChange: -8,
    budgetChange: 250,
    category: 'economia',
    requirements: { minBudget: 100 },
    availableForPositions: ['gobernador', 'presidente'],
    futureEffects: [
      { delay: 2, budgetChange: 50, popularityChange: 0 },
      { delay: 3, budgetChange: 50, popularityChange: 0 },
      { delay: 4, budgetChange: 50, popularityChange: 0 }
    ],
    affectedGroups: {
      supports: ['ongs'],
      opposes: ['empresarios', 'clase-alta', 'sector-financiero']
    },
    satisfiesDemand: ['simplificación tributaria']
  },
  {
    id: 'subsidios_industriales',
    title: 'Subsidios Industriales',
    description: 'Apoyo económico al sector industrial',
    icon: Factory,
    popularityChange: 10,
    budgetChange: -300,
    category: 'economia',
    requirements: { minBudget: 300 },
    affectedGroups: {
      supports: ['empresarios', 'sindicatos'],
      opposes: ['sector-financiero', 'ongs']
    }
  },
  {
    id: 'reforma_impositiva',
    title: 'Reforma Impositiva',
    description: 'Modificar el sistema tributario',
    icon: Calculator,
    popularityChange: -10,
    budgetChange: 400,
    category: 'economia',
    requirements: { minBudget: 200 },
    availableForPositions: ['gobernador', 'presidente'],
    // NOTA (balance de datos): minLegislativeSupport: 45 puede ser imposible de
    // alcanzar — legislativeSupport es null hasta el año 2 y queda fijo después.
    // Se mantiene deliberadamente; NO cambiar el valor.
    prerequisites: {
      requiredActions: ['mejorar_recaudacion'],
      minLegislativeSupport: 45
    },
    affectedGroups: {
      supports: ['ongs', 'sectores-populares'],
      opposes: ['empresarios', 'clase-alta']
    },
    satisfiesDemand: ['simplificación tributaria']
  },
  {
    id: 'incentivos_exportacion',
    title: 'Incentivos a la Exportación',
    description: 'Fomentar las exportaciones',
    icon: TrendingUp,
    popularityChange: 8,
    budgetChange: -250,
    category: 'economia',
    requirements: { minBudget: 250 },
    availableForPositions: ['gobernador', 'presidente'],
    affectedGroups: {
      supports: ['empresarios', 'sector-agricola'],
      opposes: []
    }
  },
  {
    id: 'control_precios',
    title: 'Control de Precios',
    description: 'Regular precios de productos básicos',
    icon: LineChart,
    popularityChange: 15,
    budgetChange: -150,
    category: 'economia',
    requirements: { minBudget: 150 },
    affectedGroups: {
      supports: ['sectores-populares', 'sindicatos', 'clase-media'],
      opposes: ['empresarios', 'clase-alta']
    },
    satisfiesDemand: ['Control de inflación']
  },
  {
    id: 'fomento_emprendimiento',
    title: 'Fomento al Emprendimiento',
    description: 'Apoyo a nuevos emprendedores. Genera ingresos fiscales a largo plazo.',
    icon: Lightbulb,
    popularityChange: 12,
    budgetChange: -200,
    category: 'economia',
    requirements: { minBudget: 200 },
    futureEffects: [
      { delay: 4, budgetChange: 30, popularityChange: 0 },
      { delay: 5, budgetChange: 30, popularityChange: 0 },
      { delay: 6, budgetChange: 30, popularityChange: 0 }
    ],
    affectedGroups: {
      supports: ['empresarios', 'cooperativas', 'clase-media'],
      opposes: []
    }
  },
  {
    id: 'aumento_salarial',
    title: 'Aumento Salarial General',
    description: 'Incrementar salarios del sector público',
    icon: CircleDollarSign,
    popularityChange: 20,
    budgetChange: -400,
    category: 'economia',
    requirements: { minBudget: 400 },
    availableForPositions: ['gobernador', 'presidente'],
    affectedGroups: {
      supports: ['sindicatos', 'sectores-populares'],
      opposes: ['empresarios', 'clase-alta']
    },
    satisfiesDemand: ['Paritarias']
  },
  {
    id: 'reduccion_gasto',
    title: 'Reducción del Gasto Público',
    description: 'Optimizar el gasto estatal',
    icon: TrendingDown,
    popularityChange: -20,
    budgetChange: 300,
    category: 'economia',
    requirements: { minBudget: 0 },
    affectedGroups: {
      supports: ['empresarios', 'sector-financiero', 'clase-alta'],
      opposes: ['sindicatos', 'sectores-populares']
    }
  },
  {
    id: 'prestamo_internacional',
    title: 'Préstamo Internacional',
    description: 'Solicitar financiamiento internacional',
    icon: Globe,
    popularityChange: -5,
    budgetChange: 800,
    category: 'economia',
    requirements: { minBudget: 0 },
    availableForPositions: ['presidente'],
    prerequisites: {
      requiredActions: ['mejorar_recaudacion']
    },
    cooldown: 8,
    diminishingFactor: 0.90,
    isLoan: true,
    multiEffects: {
      stabilityChange: 5,
      legitimacyChange: -8
    },
    futureEffects: [{ delay: 4, budgetChange: -100, popularityChange: -3 }],
    affectedGroups: {
      supports: ['sector-financiero'],
      opposes: ['opositores', 'ongs']
    }
  },
  {
    id: 'prestamo_local',
    title: 'Préstamo Local',
    description: 'Obtener financiamiento del mercado local',
    icon: Landmark,
    popularityChange: -3,
    budgetChange: 500,
    category: 'economia',
    requirements: { minBudget: 0 },
    availableForPositions: ['gobernador', 'presidente'],
    cooldown: 8,
    diminishingFactor: 0.90,
    isLoan: true,
    multiEffects: {
      legitimacyChange: -5
    },
    futureEffects: [{ delay: 3, budgetChange: -75, popularityChange: -2 }],
    affectedGroups: {
      supports: ['sector-financiero', 'empresarios'],
      opposes: ['opositores']
    }
  },
  {
    id: 'atraccion_inversiones',
    title: 'Atracción de Inversiones',
    description: 'Atraer capital extranjero',
    icon: BadgeDollarSign,
    popularityChange: 10,
    budgetChange: -200,
    category: 'economia',
    requirements: { minBudget: 200 },
    availableForPositions: ['gobernador', 'presidente'],
    affectedGroups: {
      supports: ['empresarios', 'sector-financiero'],
      opposes: ['sindicatos']
    }
  },

  // =====================
  // SOCIAL
  // =====================
  {
    id: 'plan_viviendas',
    title: 'Plan de Viviendas',
    description: 'Construir viviendas sociales',
    icon: Building,
    popularityChange: 20,
    budgetChange: -400,
    category: 'social',
    requirements: { minBudget: 400 },
    futureEffects: [
      { delay: 3, budgetChange: -50, popularityChange: 5 },
      { delay: 6, budgetChange: 0, popularityChange: 8 }
    ],
    affectedGroups: {
      supports: ['sectores-populares', 'clase-media', 'sindicatos'],
      opposes: ['clase-alta']
    },
    satisfiesDemand: ['acceso a vivienda']
  },
  {
    id: 'programa_educativo',
    title: 'Programa Educativo',
    description: 'Mejorar la calidad educativa',
    icon: GraduationCap,
    popularityChange: 15,
    budgetChange: -300,
    category: 'social',
    requirements: { minBudget: 300 },
    affectedGroups: {
      supports: ['estudiantiles', 'clase-media', 'academicos'],
      opposes: []
    },
    satisfiesDemand: ['Presupuesto educativo']
  },
  {
    id: 'salud_preventiva',
    title: 'Programa de Salud Preventiva',
    description: 'Fortalecer la atención primaria',
    icon: Heart,
    popularityChange: 18,
    budgetChange: -350,
    category: 'social',
    requirements: { minBudget: 350 },
    affectedGroups: {
      supports: ['sectores-populares', 'clase-media', 'ongs'],
      opposes: []
    },
    satisfiesDemand: ['mejora en servicios públicos']
  },
  {
    id: 'empleo_joven',
    title: 'Programa de Empleo Joven',
    description: 'Inserción laboral juvenil',
    icon: Users2,
    popularityChange: 15,
    budgetChange: -250,
    category: 'social',
    requirements: { minBudget: 250 },
    affectedGroups: {
      supports: ['estudiantiles', 'sindicatos', 'sectores-populares'],
      opposes: []
    },
    satisfiesDemand: ['condiciones laborales']
  },
  {
    id: 'cobertura_social',
    title: 'Ampliación de Cobertura Social',
    description: 'Expandir programas sociales',
    icon: Users,
    popularityChange: 20,
    budgetChange: -400,
    category: 'social',
    requirements: { minBudget: 400 },
    affectedGroups: {
      supports: ['sectores-populares', 'ongs', 'cooperativas'],
      opposes: ['empresarios', 'clase-alta']
    },
    satisfiesDemand: ['Ayuda social']
  },
  {
    id: 'alfabetizacion',
    title: 'Campaña de Alfabetización',
    description: 'Reducir el analfabetismo',
    icon: BookOpen,
    popularityChange: 12,
    budgetChange: -200,
    category: 'social',
    requirements: { minBudget: 200 },
    affectedGroups: {
      supports: ['sectores-populares', 'estudiantiles', 'academicos', 'ongs'],
      opposes: []
    }
  },
  {
    id: 'inclusion_digital',
    title: 'Plan de Inclusión Digital',
    description: 'Reducir la brecha digital',
    icon: Laptop,
    popularityChange: 15,
    budgetChange: -300,
    category: 'social',
    requirements: { minBudget: 300 },
    affectedGroups: {
      supports: ['clase-media', 'estudiantiles', 'empresarios'],
      opposes: []
    }
  },
  {
    id: 'programa_alimentario',
    title: 'Programa Alimentario',
    description: 'Asistencia alimentaria',
    icon: Utensils,
    popularityChange: 20,
    budgetChange: -350,
    category: 'social',
    requirements: { minBudget: 350 },
    affectedGroups: {
      supports: ['sectores-populares', 'ongs', 'cooperativas'],
      opposes: []
    },
    satisfiesDemand: ['Ayuda social']
  },
  {
    id: 'tercera_edad',
    title: 'Asistencia a la Tercera Edad',
    description: 'Apoyo a adultos mayores',
    icon: Heart,
    popularityChange: 15,
    budgetChange: -250,
    category: 'social',
    requirements: { minBudget: 250 },
    affectedGroups: {
      supports: ['sectores-populares', 'clase-media', 'ongs'],
      opposes: []
    },
    satisfiesDemand: ['Ayuda social']
  },
  {
    id: 'igualdad_genero',
    title: 'Plan de Igualdad de Género',
    description: 'Promover la equidad de género',
    icon: Users,
    popularityChange: 15,
    budgetChange: -200,
    category: 'social',
    requirements: { minBudget: 200 },
    affectedGroups: {
      supports: ['feministas', 'ongs', 'estudiantiles'],
      opposes: []
    },
    satisfiesDemand: ['Paridad salarial', 'protección contra violencia']
  },

  // =====================
  // INFRAESTRUCTURA
  // =====================
  {
    id: 'transporte_publico',
    title: 'Transporte Público',
    description: 'Mejorar el sistema de transporte',
    icon: Bus,
    popularityChange: 15,
    budgetChange: -400,
    category: 'infraestructura',
    requirements: { minBudget: 400 },
    affectedGroups: {
      supports: ['sectores-populares', 'clase-media', 'sindicatos'],
      opposes: ['empresarios']
    },
    satisfiesDemand: ['mejora en servicios públicos']
  },
  {
    id: 'energia_renovable',
    title: 'Energía Renovable',
    description: 'Desarrollar energías limpias',
    icon: Sun,
    popularityChange: 12,
    budgetChange: -500,
    category: 'infraestructura',
    requirements: { minBudget: 500 },
    availableForPositions: ['gobernador', 'presidente'],
    prerequisites: {
      requiredActions: ['estudio_factibilidad']
    },
    affectedGroups: {
      supports: ['ambientalistas', 'ongs', 'academicos'],
      opposes: ['empresarios']
    },
    satisfiesDemand: ['Políticas ambientales']
  },
  {
    id: 'construccion_hospitales',
    title: 'Construcción de Hospitales',
    description: 'Ampliar la red hospitalaria',
    icon: Building2,
    popularityChange: 20,
    budgetChange: -600,
    category: 'infraestructura',
    requirements: { minBudget: 600 },
    availableForPositions: ['gobernador', 'presidente'],
    prerequisites: {
      requiredActions: ['estudio_factibilidad']
    },
    affectedGroups: {
      supports: ['sectores-populares', 'clase-media', 'sindicatos'],
      opposes: []
    },
    satisfiesDemand: ['mejora en servicios públicos']
  },
  {
    id: 'viviendas_rurales',
    title: 'Desarrollo de Viviendas Rurales',
    description: 'Mejorar viviendas en zonas rurales',
    icon: Building,
    popularityChange: 15,
    budgetChange: -300,
    category: 'infraestructura',
    requirements: { minBudget: 300 },
    affectedGroups: {
      supports: ['sector-agricola', 'sectores-populares'],
      opposes: []
    },
    satisfiesDemand: ['acceso a vivienda']
  },
  {
    id: 'modernizacion_aeropuertos',
    title: 'Modernización de Aeropuertos',
    description: 'Actualizar infraestructura aeroportuaria',
    icon: Plane,
    popularityChange: 10,
    budgetChange: -700,
    category: 'infraestructura',
    requirements: { minBudget: 700 },
    availableForPositions: ['presidente'],
    prerequisites: {
      requiredActions: ['estudio_factibilidad', 'infraestructura_vial']
    },
    affectedGroups: {
      supports: ['empresarios', 'clase-alta'],
      opposes: ['ambientalistas']
    }
  },
  {
    id: 'red_comunicaciones',
    title: 'Red de Comunicaciones',
    description: 'Expandir la red de telecomunicaciones',
    icon: Wifi,
    popularityChange: 12,
    budgetChange: -400,
    category: 'infraestructura',
    requirements: { minBudget: 400 },
    availableForPositions: ['gobernador', 'presidente'],
    affectedGroups: {
      supports: ['empresarios', 'clase-media', 'academicos'],
      opposes: []
    },
    satisfiesDemand: ['infraestructura']
  },
  {
    id: 'reforestacion',
    title: 'Programa de Reforestación',
    description: 'Recuperar áreas verdes',
    icon: TreePine,
    popularityChange: 15,
    budgetChange: -200,
    category: 'infraestructura',
    requirements: { minBudget: 200 },
    affectedGroups: {
      supports: ['ambientalistas', 'ongs', 'cooperativas'],
      opposes: ['sector-agricola']
    },
    satisfiesDemand: ['Políticas ambientales', 'control de contaminación']
  },
  {
    id: 'infraestructura_vial',
    title: 'Mejorar Infraestructura Vial',
    description: 'Renovar la red de carreteras',
    icon: Construction,
    popularityChange: 15,
    budgetChange: -500,
    category: 'infraestructura',
    requirements: { minBudget: 500 },
    prerequisites: {
      requiredActions: ['estudio_factibilidad']
    },
    affectedGroups: {
      supports: ['empresarios', 'sector-agricola', 'clase-media'],
      opposes: []
    },
    satisfiesDemand: ['Mejora de caminos rurales']
  },
  {
    id: 'tratamiento_agua',
    title: 'Plantas de Tratamiento de Agua',
    description: 'Mejorar el tratamiento de agua',
    icon: Droplet,
    popularityChange: 12,
    budgetChange: -400,
    category: 'infraestructura',
    requirements: { minBudget: 400 },
    affectedGroups: {
      supports: ['ambientalistas', 'sectores-populares', 'ongs'],
      opposes: []
    },
    satisfiesDemand: ['control de contaminación']
  },
  {
    id: 'red_gas',
    title: 'Red de Gas Natural',
    description: 'Expandir la red de gas',
    icon: Flame,
    popularityChange: 15,
    budgetChange: -450,
    category: 'infraestructura',
    requirements: { minBudget: 450 },
    availableForPositions: ['gobernador', 'presidente'],
    affectedGroups: {
      supports: ['empresarios', 'clase-media', 'sindicatos'],
      opposes: ['ambientalistas']
    },
    satisfiesDemand: ['infraestructura']
  },
  {
    id: 'estudio_factibilidad',
    title: 'Estudio de factibilidad',
    description: 'Evaluación técnica y económica preliminar de obras de infraestructura. Reduce el costo de futuras obras.',
    icon: ClipboardList,
    popularityChange: 2,
    budgetChange: -80,
    category: 'infraestructura',
    requirements: { minBudget: 80 },
    cooldown: 2,
    futureEffects: [{
      delay: 1,
      budgetChange: -15,
      popularityChange: 0
    }],
    affectedGroups: {
      supports: ['empresarios', 'academicos'],
      opposes: []
    }
  },
  {
    id: 'plan_hidrico',
    title: 'Plan Hídrico',
    description: 'Obras de irrigación, canales y gestión del agua',
    icon: Droplet,
    popularityChange: 14,
    budgetChange: -450,
    category: 'infraestructura',
    requirements: { minBudget: 450 },
    futureEffects: [
      { delay: 3, budgetChange: -30, popularityChange: 4 },
      { delay: 5, budgetChange: -20, popularityChange: 3 }
    ],
    affectedGroups: {
      supports: ['sector-agricola', 'ambientalistas', 'cooperativas'],
      opposes: []
    },
    satisfiesDemand: ['infraestructura']
  },
  {
    id: 'mantenimiento_urbano',
    title: 'Mantenimiento Urbano',
    description: 'Reparación y mantenimiento de espacios públicos y edificios municipales',
    icon: Construction,
    popularityChange: 10,
    budgetChange: -250,
    category: 'infraestructura',
    requirements: { minBudget: 250 },
    futureEffects: [
      { delay: 2, budgetChange: -25, popularityChange: 2 },
      { delay: 4, budgetChange: -20, popularityChange: 3 }
    ],
    affectedGroups: {
      supports: ['clase-media', 'sectores-populares'],
      opposes: []
    },
    satisfiesDemand: ['mejora en servicios públicos']
  },
  {
    id: 'plan_conectividad',
    title: 'Plan de Conectividad',
    description: 'Despliegue de fibra óptica y redes de internet en zonas sin cobertura',
    icon: Wifi,
    popularityChange: 13,
    budgetChange: -350,
    category: 'infraestructura',
    requirements: { minBudget: 350 },
    availableForPositions: ['gobernador', 'presidente'],
    futureEffects: [
      { delay: 3, budgetChange: -30, popularityChange: 3 },
      { delay: 6, budgetChange: -20, popularityChange: 5 }
    ],
    affectedGroups: {
      supports: ['empresarios', 'clase-media', 'academicos', 'estudiantiles'],
      opposes: []
    },
    satisfiesDemand: ['infraestructura']
  },

  // =====================
  // DIPLOMACIA
  // =====================
  {
    id: 'acuerdo_sindical',
    title: 'Acuerdo Sindical',
    description: 'Negociar con sindicatos',
    icon: Handshake,
    popularityChange: 15,
    budgetChange: -200,
    category: 'diplomacia',
    requirements: { minBudget: 200 },
    availableForPositions: ['intendente', 'gobernador', 'presidente'],
    affectedGroups: {
      supports: ['sindicatos', 'sectores-populares'],
      opposes: ['empresarios', 'clase-alta']
    },
    satisfiesDemand: ['Paritarias', 'condiciones laborales']
  },
  {
    id: 'alianza_politica',
    title: 'Alianza Política',
    description: 'Formar coaliciones políticas',
    icon: Users2,
    popularityChange: 10,
    budgetChange: -150,
    category: 'diplomacia',
    requirements: { minBudget: 150 },
    availableForPositions: ['intendente', 'gobernador', 'presidente'],
    affectedGroups: {
      supports: ['aliados'],
      opposes: ['opositores']
    },
    satisfiesDemand: ['Espacios de poder']
  },
  {
    id: 'tratado_comercio',
    title: 'Tratado de Libre Comercio',
    description: 'Establecer acuerdos comerciales',
    icon: Globe,
    popularityChange: 8,
    budgetChange: -300,
    category: 'diplomacia',
    requirements: { minBudget: 300 },
    availableForPositions: ['presidente'],
    prerequisites: {
      minGroupSupport: { empresarios: 60 }
    },
    affectedGroups: {
      supports: ['empresarios', 'sector-agricola', 'sector-financiero'],
      opposes: ['sindicatos']
    }
  },
  {
    id: 'cooperacion_internacional',
    title: 'Cooperación Internacional',
    description: 'Fortalecer lazos internacionales',
    icon: Handshake,
    popularityChange: 12,
    budgetChange: -250,
    category: 'diplomacia',
    requirements: { minBudget: 250 },
    availableForPositions: ['gobernador', 'presidente'],
    affectedGroups: {
      supports: ['ongs', 'academicos', 'aliados'],
      opposes: ['opositores']
    }
  },
  {
    id: 'acuerdo_ambiental',
    title: 'Acuerdo Ambiental',
    description: 'Compromisos ambientales internacionales',
    icon: Leaf,
    popularityChange: 15,
    budgetChange: -200,
    category: 'diplomacia',
    requirements: { minBudget: 200 },
    availableForPositions: ['gobernador', 'presidente'],
    affectedGroups: {
      supports: ['ambientalistas', 'ongs', 'academicos'],
      opposes: ['empresarios']
    },
    satisfiesDemand: ['Políticas ambientales']
  },
  {
    id: 'participacion_cumbres',
    title: 'Participación en Cumbres',
    description: 'Asistir a reuniones internacionales',
    icon: Users,
    popularityChange: 8,
    budgetChange: -150,
    category: 'diplomacia',
    requirements: { minBudget: 150 },
    availableForPositions: ['presidente'],
    affectedGroups: {
      supports: ['aliados', 'ongs'],
      opposes: ['opositores']
    }
  },
  {
    id: 'mediacion_conflictos',
    title: 'Mediación en Conflictos',
    description: 'Resolver disputas regionales',
    icon: Scale,
    popularityChange: 10,
    budgetChange: -200,
    category: 'diplomacia',
    requirements: { minBudget: 200 },
    availableForPositions: ['gobernador', 'presidente'],
    affectedGroups: {
      supports: ['ongs', 'aliados'],
      opposes: ['opositores']
    }
  },

  // =====================
  // SEGURIDAD
  // =====================
  {
    id: 'seguridad_ciudadana',
    title: 'Seguridad Ciudadana',
    description: 'Mejorar la seguridad pública',
    icon: Shield,
    popularityChange: 20,
    budgetChange: -400,
    category: 'seguridad',
    requirements: { minBudget: 400 },
    cooldown: 3,
    diminishingFactor: 0.85,
    multiEffects: {
      stabilityChange: 10,
      legitimacyChange: 5,
      votingIntentionChange: 3
    },
    futureEffects: [{ delay: 3, budgetChange: -80, popularityChange: -2 }],
    affectedGroups: {
      supports: ['clase-media', 'clase-alta', 'empresarios'],
      opposes: []
    },
    satisfiesDemand: ['seguridad']
  },
  {
    id: 'lucha_narcotrafico',
    title: 'Lucha contra el Narcotráfico',
    description: 'Combatir el tráfico de drogas',
    icon: ShieldCheck,
    popularityChange: 15,
    budgetChange: -500,
    category: 'seguridad',
    requirements: { minBudget: 500 },
    availableForPositions: ['gobernador', 'presidente'],
    prerequisites: {
      requiredActions: ['fortalecimiento_justicia']
    },
    affectedGroups: {
      supports: ['clase-media', 'ongs', 'aliados'],
      opposes: ['sectores-populares']
    },
    satisfiesDemand: ['seguridad']
  },
  {
    id: 'programa_desarme',
    title: 'Programa de Desarme',
    description: 'Reducir armas ilegales',
    icon: AlertCircle,
    popularityChange: 12,
    budgetChange: -300,
    category: 'seguridad',
    requirements: { minBudget: 300 },
    affectedGroups: {
      supports: ['ongs', 'clase-media', 'estudiantiles'],
      opposes: []
    },
    satisfiesDemand: ['seguridad']
  },
  {
    id: 'fortalecimiento_justicia',
    title: 'Fortalecimiento de la Justicia',
    description: 'Mejorar el sistema judicial',
    icon: Scale,
    popularityChange: 10,
    budgetChange: -400,
    category: 'seguridad',
    requirements: { minBudget: 400 },
    availableForPositions: ['gobernador', 'presidente'],
    affectedGroups: {
      supports: ['ongs', 'clase-media', 'aliados'],
      opposes: ['opositores']
    },
    satisfiesDemand: ['Transparencia', 'rendición de cuentas']
  },
  {
    id: 'sistema_vigilancia',
    title: 'Sistema de Vigilancia',
    description: 'Implementar cámaras de seguridad',
    icon: Camera,
    popularityChange: 15,
    budgetChange: -350,
    category: 'seguridad',
    requirements: { minBudget: 350 },
    availableForPositions: ['gobernador', 'presidente'],
    affectedGroups: {
      supports: ['clase-media', 'empresarios'],
      opposes: ['ongs']
    },
    satisfiesDemand: ['seguridad']
  },
  {
    id: 'policia_proximidad',
    title: 'Policía de Proximidad',
    description: 'Acercar la policía a la comunidad',
    icon: Shield,
    popularityChange: 18,
    budgetChange: -300,
    category: 'seguridad',
    requirements: { minBudget: 300 },
    affectedGroups: {
      supports: ['sectores-populares', 'clase-media', 'ongs'],
      opposes: []
    },
    satisfiesDemand: ['seguridad']
  },
  {
    id: 'prevencion_delito',
    title: 'Prevención del Delito',
    description: 'Programas de prevención',
    icon: ShieldCheck,
    popularityChange: 15,
    budgetChange: -250,
    category: 'seguridad',
    requirements: { minBudget: 250 },
    affectedGroups: {
      supports: ['estudiantiles', 'clase-media', 'ongs', 'sectores-populares'],
      opposes: []
    },
    satisfiesDemand: ['seguridad']
  },

  // =====================
  // CULTURA
  // =====================
  {
    id: 'programa_cultural',
    title: 'Programa Cultural',
    description: 'Fomentar actividades culturales',
    icon: Palette,
    popularityChange: 12,
    budgetChange: -200,
    category: 'cultura',
    requirements: { minBudget: 200 },
    affectedGroups: {
      supports: ['artistas', 'academicos', 'estudiantiles'],
      opposes: []
    },
    satisfiesDemand: ['Financiamiento cultural']
  },
  {
    id: 'festival_arte',
    title: 'Festival Nacional de Arte',
    description: 'Organizar festival artístico',
    icon: Music,
    popularityChange: 15,
    budgetChange: -300,
    category: 'cultura',
    requirements: { minBudget: 300 },
    affectedGroups: {
      supports: ['artistas', 'estudiantiles', 'clase-media'],
      opposes: []
    },
    satisfiesDemand: ['Financiamiento cultural']
  },
  {
    id: 'patrimonio_historico',
    title: 'Protección del Patrimonio',
    description: 'Preservar sitios históricos',
    icon: Landmark,
    popularityChange: 10,
    budgetChange: -250,
    category: 'cultura',
    requirements: { minBudget: 250 },
    affectedGroups: {
      supports: ['artistas', 'academicos', 'ongs', 'minorias-etnicas'],
      opposes: ['empresarios']
    },
    satisfiesDemand: ['Financiamiento cultural', 'infraestructura']
  },
  {
    id: 'red_bibliotecas',
    title: 'Red de Bibliotecas',
    description: 'Expandir bibliotecas públicas',
    icon: Library,
    popularityChange: 12,
    budgetChange: -200,
    category: 'cultura',
    requirements: { minBudget: 200 },
    affectedGroups: {
      supports: ['estudiantiles', 'academicos', 'clase-media'],
      opposes: []
    },
    satisfiesDemand: ['infraestructura']
  },
  {
    id: 'centros_culturales',
    title: 'Centros Culturales',
    description: 'Crear espacios culturales',
    icon: Building,
    popularityChange: 15,
    budgetChange: -350,
    category: 'cultura',
    requirements: { minBudget: 350 },
    affectedGroups: {
      supports: ['artistas', 'estudiantiles', 'cooperativas', 'sectores-populares'],
      opposes: []
    },
    satisfiesDemand: ['Financiamiento cultural', 'infraestructura']
  },
  {
    id: 'escuelas_arte',
    title: 'Escuelas de Arte',
    description: 'Formar artistas locales',
    icon: Brush,
    popularityChange: 12,
    budgetChange: -250,
    category: 'cultura',
    requirements: { minBudget: 250 },
    affectedGroups: {
      supports: ['artistas', 'estudiantiles', 'academicos'],
      opposes: []
    },
    satisfiesDemand: ['Financiamiento cultural']
  },
  {
    id: 'museos_interactivos',
    title: 'Museos Interactivos',
    description: 'Crear museos modernos',
    icon: Building2,
    popularityChange: 15,
    budgetChange: -400,
    category: 'cultura',
    requirements: { minBudget: 400 },
    affectedGroups: {
      supports: ['artistas', 'academicos', 'estudiantiles', 'clase-media'],
      opposes: []
    },
    satisfiesDemand: ['Financiamiento cultural', 'infraestructura']
  },
  {
    id: 'festivales_regionales',
    title: 'Festivales Regionales',
    description: 'Promover cultura regional',
    icon: Music,
    popularityChange: 18,
    budgetChange: -300,
    category: 'cultura',
    requirements: { minBudget: 300 },
    affectedGroups: {
      supports: ['artistas', 'sectores-populares', 'minorias-etnicas'],
      opposes: []
    },
    satisfiesDemand: ['Financiamiento cultural']
  },

  // =====================
  // EDUCACIÓN
  // =====================
  {
    id: 'promover_educacion',
    title: 'Promover Educación',
    description: 'Mejorar la calidad educativa a través de reformas',
    icon: GraduationCap,
    popularityChange: 10,
    budgetChange: -100,
    category: 'educacion',
    requirements: { minBudget: 100 },
    affectedGroups: {
      supports: ['estudiantiles', 'academicos', 'clase-media'],
      opposes: []
    },
    satisfiesDemand: ['Presupuesto educativo']
  },

  // =====================
  // TURISMO
  // =====================
  {
    id: 'fomentar_turismo',
    title: 'Fomentar Turismo',
    description: 'Aumentar el turismo local mediante campañas',
    icon: Plane,
    popularityChange: 8,
    budgetChange: -50,
    category: 'turismo',
    requirements: { minBudget: 50 },
    affectedGroups: {
      supports: ['empresarios', 'artistas', 'clase-media'],
      opposes: []
    }
  },

  // =====================
  // TECNOLOGÍA
  // =====================
  {
    id: 'desarrollar_tecnologia',
    title: 'Desarrollar Tecnología',
    description: 'Fomentar la innovación tecnológica en la región',
    icon: Cpu,
    popularityChange: 12,
    budgetChange: -200,
    category: 'tecnologia',
    requirements: { minBudget: 200 },
    affectedGroups: {
      supports: ['empresarios', 'academicos', 'estudiantiles'],
      opposes: []
    },
    satisfiesDemand: ['Presupuesto científico']
  }
];
