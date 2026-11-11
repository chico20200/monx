// Utilidades de presentación: tipos, estadísticas y formatos en español.

const SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites';

/** id numérico de cada tipo en PokéAPI (para su ícono) + nombre y color. */
export const TYPES: Record<string, { id: number; es: string; color: string }> = {
  normal: { id: 1, es: 'Normal', color: '#A8A77A' },
  fighting: { id: 2, es: 'Lucha', color: '#C22E28' },
  flying: { id: 3, es: 'Volador', color: '#A98FF3' },
  poison: { id: 4, es: 'Veneno', color: '#A33EA1' },
  ground: { id: 5, es: 'Tierra', color: '#E2BF65' },
  rock: { id: 6, es: 'Roca', color: '#B6A136' },
  bug: { id: 7, es: 'Bicho', color: '#A6B91A' },
  ghost: { id: 8, es: 'Fantasma', color: '#735797' },
  steel: { id: 9, es: 'Acero', color: '#B7B7CE' },
  fire: { id: 10, es: 'Fuego', color: '#EE8130' },
  water: { id: 11, es: 'Agua', color: '#6390F0' },
  grass: { id: 12, es: 'Planta', color: '#7AC74C' },
  electric: { id: 13, es: 'Eléctrico', color: '#F7D02C' },
  psychic: { id: 14, es: 'Psíquico', color: '#F95587' },
  ice: { id: 15, es: 'Hielo', color: '#96D9D6' },
  dragon: { id: 16, es: 'Dragón', color: '#6F35FC' },
  dark: { id: 17, es: 'Siniestro', color: '#705746' },
  fairy: { id: 18, es: 'Hada', color: '#D685AD' },
};

/**
 * Ícono del tipo. PokeWiki lo obtenía con una petición a /type/{nombre};
 * aquí se arma la misma URL (sword-shield/small) sin peticiones extra.
 */
export function typeIcon(type: string): string {
  const t = TYPES[type];
  return t ? `${SPRITES}/types/generation-viii/sword-shield/small/${t.id}.png` : '';
}
export const typeName = (type: string) => TYPES[type]?.es ?? type;
export const typeColor = (type: string) => TYPES[type]?.color ?? '#999';

export const STAT_KEYS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'] as const;
export const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'At. esp.',
  'special-defense': 'Def. esp.',
  speed: 'Velocidad',
};
/** Valor máximo posible de una estadística base (Blissey, HP 255). */
export const STAT_MAX = 255;

export const padId = (id: number) => `#${String(id).padStart(4, '0')}`;
export const prettyName = (name: string) =>
  name.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
export const meters = (dm: number) => `${(dm / 10).toLocaleString('es-EC')} m`;
export const kilos = (hg: number) => `${(hg / 10).toLocaleString('es-EC')} kg`;
