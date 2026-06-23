import { InterestGroup } from '../types/game';
import { 
  Briefcase, Wheat, Landmark, Users, Home, 
  UserCircle2, Building2, Users2, Building, 
  TreePine, HeartHandshake, GraduationCap, 
  HandHeart, Handshake, AlertOctagon, 
  Palette, Trophy, School
} from 'lucide-react';

export const interestGroups: InterestGroup[] = [
  {
    id: 'sectores-economicos',
    name: 'Sectores Económicos',
    subgroups: [
      {
        id: 'empresarios',
        name: 'Empresarios',
        description: 'Representantes del sector empresarial y comercial',
        influence: 8,
        popularity: 2,
        interests: ['Reducción de impuestos', 'desregulación', 'incentivos a la inversión'],
        demands: ['Reforma laboral', 'simplificación tributaria'],
        baseSupport: 40,
        supportMultiplier: 1.2,
        resourceDemand: 300,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: Briefcase
      },
      {
        id: 'sector-agricola',
        name: 'Sector Agrícola',
        description: 'Productores agrícolas y ganaderos',
        influence: 7,
        popularity: 2,
        interests: ['Subsidios agrícolas', 'infraestructura rural'],
        demands: ['Mejora de caminos rurales', 'apoyo en sequías'],
        baseSupport: 45,
        supportMultiplier: 1.1,
        resourceDemand: 250,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: Wheat
      },
      {
        id: 'sector-financiero',
        name: 'Sector Financiero',
        description: 'Bancos y entidades financieras',
        influence: 9,
        popularity: 1,
        interests: ['Estabilidad monetaria', 'regulación favorable'],
        demands: ['Autonomía del banco central', 'control de la inflación'],
        baseSupport: 35,
        supportMultiplier: 1.3,
        resourceDemand: 400,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: Landmark
      },
      {
        id: 'sindicatos',
        name: 'Sindicatos',
        description: 'Organizaciones sindicales y gremiales',
        influence: 8,
        popularity: 3,
        interests: ['Derechos laborales', 'aumentos salariales'],
        demands: ['Paritarias', 'condiciones laborales'],
        baseSupport: 50,
        supportMultiplier: 1.2,
        resourceDemand: 350,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: Users
      }
    ]
  },
  {
    id: 'grupos-sociales',
    name: 'Grupos Sociales',
    subgroups: [
      {
        id: 'clase-media',
        name: 'Clase Media',
        description: 'Sector medio de la población',
        influence: 7,
        popularity: 3,
        interests: ['Educación', 'seguridad', 'estabilidad económica'],
        demands: ['Control de inflación', 'mejora en servicios públicos'],
        baseSupport: 55,
        supportMultiplier: 1.1,
        resourceDemand: 200,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: Home
      },
      {
        id: 'sectores-populares',
        name: 'Sectores Populares',
        description: 'Sectores de bajos recursos',
        influence: 6,
        popularity: 3,
        interests: ['Programas sociales', 'vivienda', 'trabajo'],
        demands: ['Ayuda social', 'acceso a vivienda'],
        baseSupport: 60,
        supportMultiplier: 1.0,
        resourceDemand: 150,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: UserCircle2
      },
      {
        id: 'clase-alta',
        name: 'Clase Alta',
        description: 'Sectores de altos ingresos',
        influence: 8,
        popularity: 1,
        interests: ['Seguridad jurídica', 'baja presión fiscal'],
        demands: ['Reducción de impuestos', 'seguridad'],
        baseSupport: 30,
        supportMultiplier: 1.4,
        resourceDemand: 450,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: Building2
      },
      {
        id: 'minorias-etnicas',
        name: 'Minorías Étnicas',
        description: 'Comunidades originarias y grupos étnicos',
        influence: 5,
        popularity: 2,
        interests: ['Derechos territoriales', 'preservación cultural'],
        demands: ['Reconocimiento territorial', 'educación bilingüe'],
        baseSupport: 40,
        supportMultiplier: 1.0,
        resourceDemand: 100,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: Users2
      },
      {
        id: 'ongs',
        name: 'Organizaciones No Gubernamentales',
        description: 'ONGs y organizaciones civiles',
        influence: 6,
        popularity: 2,
        interests: ['Transparencia', 'derechos humanos'],
        demands: ['Participación ciudadana', 'rendición de cuentas'],
        baseSupport: 45,
        supportMultiplier: 1.1,
        resourceDemand: 150,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: Building
      }
    ]
  },
  {
    id: 'movimientos-sociales',
    name: 'Movimientos Sociales',
    subgroups: [
      {
        id: 'ambientalistas',
        name: 'Ambientalistas',
        description: 'Grupos de protección ambiental',
        influence: 6,
        popularity: 2,
        interests: ['Protección ambiental', 'energías renovables'],
        demands: ['Políticas ambientales', 'control de contaminación'],
        baseSupport: 45,
        supportMultiplier: 1.1,
        resourceDemand: 200,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: TreePine
      },
      {
        id: 'feministas',
        name: 'Feministas',
        description: 'Movimientos por derechos de la mujer',
        influence: 7,
        popularity: 2,
        interests: ['Igualdad de género', 'políticas inclusivas'],
        demands: ['Paridad salarial', 'protección contra violencia'],
        baseSupport: 50,
        supportMultiplier: 1.1,
        resourceDemand: 250,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: HeartHandshake
      },
      {
        id: 'estudiantiles',
        name: 'Estudiantiles',
        description: 'Organizaciones estudiantiles',
        influence: 5,
        popularity: 2,
        interests: ['Educación pública', 'becas'],
        demands: ['Presupuesto educativo', 'infraestructura'],
        baseSupport: 55,
        supportMultiplier: 1.0,
        resourceDemand: 150,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: GraduationCap
      },
      {
        id: 'cooperativas',
        name: 'Cooperativas Sociales',
        description: 'Organizaciones cooperativas',
        influence: 5,
        popularity: 2,
        interests: ['Economía social', 'apoyo estatal'],
        demands: ['Financiamiento', 'marco legal favorable'],
        baseSupport: 45,
        supportMultiplier: 1.0,
        resourceDemand: 100,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: HandHeart
      }
    ]
  },
  {
    id: 'partidos-politicos',
    name: 'Partidos Políticos',
    subgroups: [
      {
        id: 'aliados',
        name: 'Aliados',
        description: 'Partidos y grupos políticos aliados',
        influence: 8,
        popularity: 2,
        interests: ['Participación en gobierno', 'cargos'],
        demands: ['Espacios de poder', 'recursos'],
        baseSupport: 70,
        supportMultiplier: 1.3,
        resourceDemand: 400,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: Handshake
      },
      {
        id: 'opositores',
        name: 'Opositores',
        description: 'Partidos y grupos de oposición',
        influence: 7,
        popularity: 2,
        interests: ['Control del gobierno', 'alternancia'],
        demands: ['Transparencia', 'límites al poder'],
        baseSupport: 20,
        supportMultiplier: 1.2,
        resourceDemand: 300,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: AlertOctagon
      }
    ]
  },
  {
    id: 'colectivos-especificos',
    name: 'Colectivos Específicos',
    subgroups: [
      {
        id: 'artistas',
        name: 'Artistas',
        description: 'Comunidad artística y cultural',
        influence: 5,
        popularity: 2,
        interests: ['Apoyo cultural', 'espacios artísticos'],
        demands: ['Financiamiento cultural', 'infraestructura'],
        baseSupport: 45,
        supportMultiplier: 1.0,
        resourceDemand: 150,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: Palette
      },
      {
        id: 'deportistas',
        name: 'Deportistas',
        description: 'Comunidad deportiva',
        influence: 6,
        popularity: 3,
        interests: ['Infraestructura deportiva', 'apoyo'],
        demands: ['Instalaciones', 'programas deportivos'],
        baseSupport: 50,
        supportMultiplier: 1.1,
        resourceDemand: 200,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: Trophy
      },
      {
        id: 'academicos',
        name: 'Académicos',
        description: 'Comunidad académica y científica',
        influence: 7,
        popularity: 2,
        interests: ['Investigación', 'educación superior'],
        demands: ['Presupuesto científico', 'autonomía'],
        baseSupport: 45,
        supportMultiplier: 1.2,
        resourceDemand: 250,
        satisfactionLevel: 50,
        lastInteractionEffect: 0,
        icon: School
      }
    ]
  }
];