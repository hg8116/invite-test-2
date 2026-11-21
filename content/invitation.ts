// All copy and event details for the invitation live here.
// Edit this file to personalise the site — no component changes needed.

export type Lang = "en" | "de";
export const LANGS: Lang[] = ["en", "de"];

export type IconName = "drinks" | "arch" | "cocktail" | "dinner" | "cake" | "dance" | "disco" | "moon";

export const event = {
  couple: { first: "Diana", second: "Richard" },
  /** Ceremony start, with the venue's UTC offset (Mallorca is CEST, +02:00 in July). */
  start: "2027-07-27T17:30:00+02:00",
  venue: {
    name: "Sa Tafona",
    area: "Son Bunyola",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sa+Tafona+Son+Bunyola+Mallorca",
  },
  /**
   * Background music. Leave `src` as null to use the built-in synthesised
   * music-box waltz, or point it at a file in /public (e.g. "/music/song.mp3").
   */
  music: { src: null as string | null, volume: 0.6 },
  /** Days shown in the little calendar strip of "The Day". */
  calendarDays: [25, 26, 27, 28, 29],
  program: [
    { time: "17:00", icon: "drinks" },
    { time: "17:30", icon: "arch" },
    { time: "19:15", icon: "cocktail" },
    { time: "20:30", icon: "dinner" },
    { time: "22:30", icon: "cake" },
    { time: "23:00", icon: "dance" },
    { time: "23:15", icon: "disco" },
    { time: "02:00", icon: "moon" },
  ] satisfies { time: string; icon: IconName }[],
};

const en = {
  htmlLang: "en",
  langName: "English",
  envelope: {
    open: "Open the invitation",
    hint: "Tap to open",
  },
  hero: {
    and: "&",
    invite: ["We invite you to", "celebrate our wedding"],
    month: "July",
    day: "27",
    weekday: "Tuesday",
    year: "2027",
    heldAt: "To be held at",
    place: "Son Bunyola, Mallorca",
    scroll: "Scroll to the details",
  },
  countdown: {
    title: "Countdown",
    until: "Until 27 July 2027",
    units: {
      days: ["Day", "Days"],
      hours: ["Hour", "Hours"],
      minutes: ["Minute", "Minutes"],
      seconds: ["Second", "Seconds"],
    },
  },
  story: {
    title: "Our Story",
    paragraphs: [
      "Some of the best love stories begin unexpectedly, and ours was no different.",
      "What started as a chance encounter soon became endless conversations, spontaneous adventures and countless memories together.",
      "Somewhere along the way, we found our favorite place: by each other’s side.",
      "And now, we’re ready for our greatest adventure yet – a lifetime together.",
    ],
    signature: "Diana and Richard",
  },
  celebration: {
    title: "The Celebration",
    subtitle: "Ceremony & Dinner",
    description: "A ceremony in the gardens at sunset behind the Tramuntana, followed by dinner and dancing.",
    date: "Tuesday, 27 July 2027",
    time: "5:30 PM",
    map: "View on map",
  },
  day: {
    title: "The Day",
    program: "Program",
    date: "Tuesday 27 July",
    intro: "Our wedding day, from sunset drinks to the last dance.",
    items: [
      "Guests Arrival & Welcome Drinks",
      "Ceremony",
      "Cocktail Hour",
      "Dinner",
      "Cake & Toasts",
      "First Dance",
      "Dancing under the Stars",
      "Goodnight",
    ],
  },
  dress: {
    title: "Dress Code",
    code: "Black Tie",
  },
  footer: {
    line: "We can’t wait to celebrate with you",
    date: "27 · 07 · 2027",
  },
  controls: {
    language: "Language",
    soundOn: "Play music",
    soundOff: "Pause music",
  },
};

export type Copy = typeof en;

const de: Copy = {
  htmlLang: "de",
  langName: "Deutsch",
  envelope: {
    open: "Einladung öffnen",
    hint: "Zum Öffnen tippen",
  },
  hero: {
    and: "&",
    invite: ["Wir laden euch ein,", "unsere Hochzeit zu feiern"],
    month: "Juli",
    day: "27",
    weekday: "Dienstag",
    year: "2027",
    heldAt: "Wir feiern in",
    place: "Son Bunyola, Mallorca",
    scroll: "Zu den Details scrollen",
  },
  countdown: {
    title: "Countdown",
    until: "Bis zum 27. Juli 2027",
    units: {
      days: ["Tag", "Tage"],
      hours: ["Stunde", "Stunden"],
      minutes: ["Minute", "Minuten"],
      seconds: ["Sekunde", "Sekunden"],
    },
  },
  story: {
    title: "Unsere Geschichte",
    paragraphs: [
      "Manche der schönsten Liebesgeschichten beginnen ganz unerwartet – und unsere war keine Ausnahme.",
      "Was als zufällige Begegnung begann, wurde bald zu endlosen Gesprächen, spontanen Abenteuern und unzähligen gemeinsamen Erinnerungen.",
      "Irgendwo auf diesem Weg haben wir unseren Lieblingsplatz gefunden: an der Seite des anderen.",
      "Und jetzt sind wir bereit für unser größtes Abenteuer – ein ganzes Leben zu zweit.",
    ],
    signature: "Diana und Richard",
  },
  celebration: {
    title: "Die Feier",
    subtitle: "Trauung & Dinner",
    description: "Eine Trauung in den Gärten bei Sonnenuntergang vor der Tramuntana, gefolgt von Dinner und Tanz.",
    date: "Dienstag, 27. Juli 2027",
    time: "17:30 Uhr",
    map: "Auf der Karte ansehen",
  },
  day: {
    title: "Der Tag",
    program: "Programm",
    date: "Dienstag, 27. Juli",
    intro: "Unser Hochzeitstag – vom Aperitif bei Sonnenuntergang bis zum letzten Tanz.",
    items: [
      "Ankunft der Gäste & Welcome Drinks",
      "Trauung",
      "Cocktailstunde",
      "Dinner",
      "Torte & Reden",
      "Eröffnungstanz",
      "Tanzen unter den Sternen",
      "Gute Nacht",
    ],
  },
  dress: {
    title: "Dresscode",
    code: "Black Tie",
  },
  footer: {
    line: "Wir freuen uns darauf, mit euch zu feiern",
    date: "27 · 07 · 2027",
  },
  controls: {
    language: "Sprache",
    soundOn: "Musik abspielen",
    soundOff: "Musik pausieren",
  },
};

export const copy: Record<Lang, Copy> = { en, de };
