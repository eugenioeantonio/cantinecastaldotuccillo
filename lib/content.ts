/**
 * Single source of truth for Cantine Castaldo Tuccillo content.
 * Real data ported from the original site + JSON-LD. Placeholders in
 * square brackets are intentional and to be confirmed by the winery.
 */

export const brand = {
  name: "Castaldo Tuccillo",
  full: "Cantine Castaldo Tuccillo",
  tagline: "Cinque generazioni · San Gennaro Vesuviano",
  claim: "Il tempo diventa vino.",
  place: "Dal cuore del Vesuvio",
} as const;

export const contact = {
  phone: "+39 329 1606790",
  phoneHref: "tel:+393291606790",
  email: "cantinecastaldotuccillo@gmail.com",
  street: "Via Giugliani",
  city: "San Gennaro Vesuviano",
  region: "NA",
  country: "Italia",
  facebook: "https://www.facebook.com/cantinecastaldotuccillo",
  hours: [
    { days: "Lun — Sab", time: "08:30 — 13:30" },
    { days: "Lun — Sab", time: "15:00 — 20:00" },
  ],
} as const;

export const nav = [
  { label: "La Cantina", href: "#cantina" },
  { label: "Vini", href: "#vini" },
  { label: "Metodo Vesuviano", href: "#metodo" },
  { label: "Esperienze", href: "#esperienze" },
] as const;

export type Generation = {
  index: string;
  order: string;
  title: string;
  people: string;
  body: string;
};

export const generations: Generation[] = [
  {
    index: "I",
    order: "Prima generazione",
    title: "Le radici",
    people: "[Nome fondatore e anno da confermare]",
    body: "Dove tutto è cominciato: la prima vite, la prima botte, la scelta di restare legati al Vesuvio.",
  },
  {
    index: "II",
    order: "Seconda generazione",
    title: "La cura",
    people: "[Nome e periodo da confermare]",
    body: "La conoscenza del suolo lavico si affina e diventa metodo, gesto dopo gesto.",
  },
  {
    index: "III",
    order: "Terza generazione",
    title: "Il metodo",
    people: "[Nome e periodo da confermare]",
    body: "Nasce e si custodisce il gesto del Lammiccato e del Metodo Vesuviano.",
  },
  {
    index: "IV",
    order: "Quarta generazione",
    title: "Il riconoscimento",
    people: "[Nome e periodo da confermare]",
    body: "La qualità varca i confini: dal Vesuvio verso l'Europa.",
  },
  {
    index: "V",
    order: "Quinta generazione",
    title: "Oggi",
    people: "[Nome e periodo da confermare]",
    body: "La stessa terra, lo stesso rispetto — raccontati con un linguaggio nuovo.",
  },
];

export type Wine = {
  name: string;
  kind: string;
  grape: string;
  note: string;
  accent: string; // subtle per-wine tint (kept within brand family)
};

export const wines: Wine[] = [
  {
    name: "Falanghina",
    kind: "Bianco · Campania IGP",
    grape: "Falanghina",
    note: "Fiori bianchi, agrume e sale minerale. La freschezza luminosa del versante vesuviano.",
    accent: "#d9c98f",
  },
  {
    name: "Aglianico",
    kind: "Rosso · Campania IGP",
    grape: "Aglianico",
    note: "Struttura e profondità: frutti scuri, spezia e la trama tannica della terra lavica.",
    accent: "#7a1526",
  },
  {
    name: "Metodo Vesuviano",
    kind: "Spumante · Metodo tradizionale",
    grape: "Uve vesuviane",
    note: "Bollicina fine e paziente, nata dal tempo e da una rifermentazione custodita in cantina.",
    accent: "#c6ab7d",
  },
  {
    name: "Lammiccato",
    kind: "Raro · Tradizione di famiglia",
    grape: "Selezione storica",
    note: "Il vino più intimo della famiglia: un gesto antico, quasi segreto, che sopravvive nel tempo.",
    accent: "#4a0f1b",
  },
];

export const method = {
  eyebrow: "Il gesto",
  title: "Metodo Vesuviano",
  lead: "Non una tecnica soltanto: un modo di stare accanto al vino.",
  steps: [
    {
      n: "01",
      title: "La terra lavica",
      body: "Suoli minerali, poveri e vivi. Radici che scendono nella cenere del Vesuvio.",
    },
    {
      n: "02",
      title: "La vendemmia",
      body: "A mano, al momento giusto — misurato con l'occhio di chi conosce ogni filare.",
    },
    {
      n: "03",
      title: "Il tempo in cantina",
      body: "Fermentazioni lente, attese pazienti. Il Lammiccato nasce qui, nel silenzio.",
    },
    {
      n: "04",
      title: "Il calice",
      body: "Ciò che resta è il tempo reso liquido: il racconto di cinque generazioni.",
    },
  ],
} as const;

export const experience = {
  eyebrow: "Vieni a trovarci",
  title: "L'esperienza in cantina",
  lead: "Una visita tra le vigne del Vesuvio, un racconto di famiglia e un calice condiviso.",
  cards: [
    {
      k: "Visita & degustazione",
      body: "Un percorso guidato tra vigna e cantina, con i vini della famiglia in degustazione.",
    },
    {
      k: "Il territorio",
      body: "San Gennaro Vesuviano, ai piedi del vulcano: la terra che dà carattere a ogni vino.",
    },
    {
      k: "Su prenotazione",
      body: "Piccoli gruppi, tempo lento. Scrivici per costruire insieme la tua visita.",
    },
  ],
} as const;

export const seo = {
  title: "Cantine Castaldo Tuccillo · Vini Vesuviani · Cinque Generazioni",
  description:
    "Cantine Castaldo Tuccillo — cinque generazioni di vino vesuviano a San Gennaro Vesuviano. Falanghina, Aglianico, Metodo Vesuviano e il raro Lammiccato.",
  url: "https://www.cantinecastaldotuccillo.it/",
} as const;
