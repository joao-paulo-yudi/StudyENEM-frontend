import { AreaCode } from './api.service';

export interface AreaConfig {
  code: AreaCode;
  name: string;
  short: string;
  color: string;
  soft: string;
}

/** Áreas do conhecimento na ordem da prova do ENEM. */
export const AREA_LIST: AreaConfig[] = [
  { code: 'LC', name: 'Linguagens, Códigos e suas Tecnologias', short: 'Linguagens', color: '#8B5CF6', soft: '#EEE7FD' },
  { code: 'CH', name: 'Ciências Humanas e suas Tecnologias', short: 'Ciências Humanas', color: '#E0732C', soft: '#FBEADB' },
  { code: 'CN', name: 'Ciências da Natureza e suas Tecnologias', short: 'Ciências da Natureza', color: '#059669', soft: '#DCF5EB' },
  { code: 'MT', name: 'Matemática e suas Tecnologias', short: 'Matemática', color: '#2563EB', soft: '#E2ECFE' },
];

export function getAreaByCode(code: string | null | undefined): AreaConfig | undefined {
  return AREA_LIST.find(a => a.code === code);
}

export function areaShort(code: string | null | undefined): string {
  return getAreaByCode(code)?.short ?? 'Geral';
}

export function areaColor(code: string | null | undefined): string {
  return getAreaByCode(code)?.color ?? '#888';
}

export function areaSoft(code: string | null | undefined): string {
  return getAreaByCode(code)?.soft ?? '#F5F6FA';
}
