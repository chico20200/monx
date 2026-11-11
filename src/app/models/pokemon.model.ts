// Tipos de datos de PokéAPI que usa Monx (solo los campos necesarios).

export interface NamedResource {
  name: string;
  url: string;
}

export interface PokemonList {
  count: number;
  next: string | null;
  results: NamedResource[];
}

/** Entrada del índice ligero (nombre + id) usado para listar y buscar. */
export interface IndexEntry {
  id: number;
  name: string;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number; // decímetros
  weight: number; // hectogramos
  base_experience: number | null;
  types: { slot: number; type: NamedResource }[];
  abilities: { ability: NamedResource; is_hidden: boolean }[];
  stats: { base_stat: number; stat: NamedResource }[];
  sprites: {
    front_default: string | null;
    back_default: string | null;
    front_shiny: string | null;
    back_shiny: string | null;
    other?: {
      'official-artwork'?: { front_default?: string | null; front_shiny?: string | null };
      home?: { front_default?: string | null; front_shiny?: string | null };
      showdown?: {
        front_default?: string | null;
        back_default?: string | null;
        front_shiny?: string | null;
      };
    };
  };
  cries?: { latest?: string | null; legacy?: string | null };
}

export interface PokemonSpecies {
  id: number;
  genera: { genus: string; language: NamedResource }[];
  flavor_text_entries: { flavor_text: string; language: NamedResource; version: NamedResource }[];
}

export interface GalleryImage {
  url: string;
  label: string;
}
