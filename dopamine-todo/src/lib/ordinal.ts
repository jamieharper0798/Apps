const ORDINAL_WORDS = [
  'FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH', 'SEVENTH', 'EIGHTH', 'NINTH', 'TENTH',
  'ELEVENTH', 'TWELFTH', 'THIRTEENTH', 'FOURTEENTH', 'FIFTEENTH', 'SIXTEENTH', 'SEVENTEENTH',
  'EIGHTEENTH', 'NINETEENTH', 'TWENTIETH',
];

/** Spelled-out ordinal word (FIRST, SECOND, …) for n in [1,20], else a numeric suffix (21ST, 22ND, …). */
export function ordinalWord(n: number): string {
  if (n >= 1 && n <= ORDINAL_WORDS.length) return ORDINAL_WORDS[n - 1];
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}TH`;
  switch (n % 10) {
    case 1:
      return `${n}ST`;
    case 2:
      return `${n}ND`;
    case 3:
      return `${n}RD`;
    default:
      return `${n}TH`;
  }
}
