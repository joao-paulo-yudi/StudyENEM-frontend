export interface AreaConfig {
  id: string;
  name: string;
  short: string;
  color: string;
  soft: string;
  subjects: string[];
}

export const AREAS: Record<string, AreaConfig> = {
  linguagens: {
    id: 'linguagens',
    name: 'Linguagens, Códigos e suas Tecnologias',
    short: 'Linguagens',
    color: '#8B5CF6',
    soft: '#EEE7FD',
    subjects: ['Língua Portuguesa', 'Literatura', 'Inglês', 'Espanhol', 'Artes', 'Ed. Física'],
  },
  matematica: {
    id: 'matematica',
    name: 'Matemática e suas Tecnologias',
    short: 'Matemática',
    color: '#2563EB',
    soft: '#E2ECFE',
    subjects: ['Álgebra', 'Geometria', 'Funções', 'Probabilidade', 'Estatística', 'Aritmética'],
  },
  natureza: {
    id: 'natureza',
    name: 'Ciências da Natureza e suas Tecnologias',
    short: 'Ciências da Natureza',
    color: '#059669',
    soft: '#DCF5EB',
    subjects: ['Biologia', 'Química', 'Física'],
  },
  humanas: {
    id: 'humanas',
    name: 'Ciências Humanas e suas Tecnologias',
    short: 'Ciências Humanas',
    color: '#E0732C',
    soft: '#FBEADB',
    subjects: ['História', 'Geografia', 'Filosofia', 'Sociologia'],
  },
};

export const AREA_LIST = Object.values(AREAS);

export function getAreaById(id: string): AreaConfig | undefined {
  return AREAS[id];
}

export function getAreaByName(name: string): AreaConfig | undefined {
  return AREA_LIST.find(a => a.name === name);
}

export function areaNameToId(name: string): string {
  return AREA_LIST.find(a => a.name === name)?.id ?? 'linguagens';
}
