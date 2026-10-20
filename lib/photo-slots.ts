/**
 * Every photograph the site is designed around. None exists yet: until the
 * family supplies them, each slot renders as a quiet material plate (never a
 * stock or generated image). Drop a file in /public/photos and set `src`.
 * The full list, with shooting notes, is in docs/ASSET-NEEDS.md.
 */
export type PhotoSlotId =
  | "family-today"
  | "territory-vineyard"
  | "visit-cellar"
  | "visit-tasting"
  | "bottle-falanghina"
  | "bottle-aglianico"
  | "bottle-metodo-vesuviano"
  | "bottle-lammiccato";

export type PhotoSlot = {
  id: PhotoSlotId;
  /** What the photograph must show (also shown in development). */
  brief: string;
  /** Visible caption under the plate — a real place or object, no claim. */
  caption: string;
  /** Width / height. */
  ratio: number;
  /** Path under /public once the photograph exists. */
  src: string | null;
  alt: string;
};

export const PHOTO_SLOTS: Record<PhotoSlotId, PhotoSlot> = {
  "family-today": {
    id: "family-today",
    brief: "Ritratto della famiglia oggi, in cantina o tra i filari. Luce naturale bassa, toni caldi, nessuna posa da catalogo.",
    caption: "La famiglia, oggi",
    ratio: 4 / 5,
    src: null,
    alt: "La famiglia Castaldo Tuccillo in cantina",
  },
  "territory-vineyard": {
    id: "territory-vineyard",
    brief: "I vigneti di San Gennaro Vesuviano con il Vesuvio sullo sfondo. Orizzontale, luce radente di fine giornata, suolo scuro visibile.",
    caption: "I filari, ai piedi del Vesuvio",
    ratio: 16 / 9,
    src: null,
    alt: "Vigneti a San Gennaro Vesuviano con il Vesuvio sullo sfondo",
  },
  "visit-cellar": {
    id: "visit-cellar",
    brief: "Interno della cantina: botti, pietra, penombra. Verticale.",
    caption: "La cantina",
    ratio: 4 / 5,
    src: null,
    alt: "L'interno della cantina con le botti",
  },
  "visit-tasting": {
    id: "visit-tasting",
    brief: "Una degustazione reale in cantina: mani, calici, bottiglie della famiglia. Verticale, niente volti in primo piano.",
    caption: "Un calice condiviso",
    ratio: 3 / 4,
    src: null,
    alt: "Una degustazione in cantina",
  },
  "bottle-falanghina": {
    id: "bottle-falanghina",
    brief: "Bottiglia di Falanghina scontornata (PNG trasparente), frontale, etichetta leggibile, luce laterale.",
    caption: "Falanghina",
    ratio: 1 / 3,
    src: null,
    alt: "Bottiglia di Falanghina Castaldo Tuccillo",
  },
  "bottle-aglianico": {
    id: "bottle-aglianico",
    brief: "Bottiglia di Aglianico scontornata (PNG trasparente), frontale, etichetta leggibile, luce laterale.",
    caption: "Aglianico",
    ratio: 1 / 3,
    src: null,
    alt: "Bottiglia di Aglianico Castaldo Tuccillo",
  },
  "bottle-metodo-vesuviano": {
    id: "bottle-metodo-vesuviano",
    brief: "Bottiglia di Metodo Vesuviano scontornata (PNG trasparente), frontale, etichetta leggibile.",
    caption: "Metodo Vesuviano",
    ratio: 1 / 3,
    src: null,
    alt: "Bottiglia di Metodo Vesuviano Castaldo Tuccillo",
  },
  "bottle-lammiccato": {
    id: "bottle-lammiccato",
    brief: "Bottiglia di Lammiccato scontornata (PNG trasparente). È il vino raro: luce più drammatica, fondo nero.",
    caption: "Lammiccato",
    ratio: 1 / 3,
    src: null,
    alt: "Bottiglia di Lammiccato Castaldo Tuccillo",
  },
};

export const bottleSlotFor = (handle: string) =>
  PHOTO_SLOTS[`bottle-${handle}` as PhotoSlotId] ?? null;
