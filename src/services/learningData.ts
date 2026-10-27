/**
 * Learning Curricula for Numbers & Alphabets
 * Supports English, French, and Arabic independently.
 */

export type ContentType = 'numbers' | 'alphabets';
export type AudioLanguage = 'en' | 'fr' | 'ar';
export type AlphabetLanguage = 'en' | 'fr' | 'ar';

export interface SpotContentItem {
  display: string; // The text rendered on the 3D plaque (e.g. "5", "B", "ب", "٥")
  spoken: string; // The speech utterance text (e.g. "Five", "B", "باء", "خمسة")
  subtext?: string; // Optional subtitle (e.g. English transliteration or letter name)
}

// Arabic letter spoken names
export const ARABIC_ALPHABET: Array<{ char: string; name: string }> = [
  { char: 'أ', name: 'ألف' },
  { char: 'ب', name: 'باء' },
  { char: 'ت', name: 'تاء' },
  { char: 'ث', name: 'ثاء' },
  { char: 'ج', name: 'جيم' },
  { char: 'ح', name: 'حاء' },
  { char: 'خ', name: 'خاء' },
  { char: 'د', name: 'دال' },
  { char: 'ذ', name: 'ذال' },
  { char: 'ر', name: 'راء' },
  { char: 'ز', name: 'زاي' },
  { char: 'س', name: 'سين' },
  { char: 'ش', name: 'شين' },
  { char: 'ص', name: 'صاد' },
  { char: 'ض', name: 'ضاد' },
  { char: 'ط', name: 'طاء' },
  { char: 'ظ', name: 'ظاء' },
  { char: 'ع', name: 'عين' },
  { char: 'غ', name: 'غين' },
  { char: 'ف', name: 'فاء' },
  { char: 'ق', name: 'قاف' },
  { char: 'ك', name: 'كاف' },
  { char: 'ل', name: 'لام' },
  { char: 'م', name: 'ميم' },
  { char: 'ن', name: 'نون' },
  { char: 'هـ', name: 'هاء' },
  { char: 'و', name: 'واو' },
  { char: 'ي', name: 'ياء' },
];

// Arabic letters with Harakat for Hard mode
export const ARABIC_HARAKAT: Array<{ char: string; name: string }> = [
  { char: 'أَ', name: 'ألف فتحة أَ' },
  { char: 'بُ', name: 'باء ضمة بُ' },
  { char: 'تِ', name: 'تاء كسرة تِ' },
  { char: 'ثَ', name: 'ثاء فتحة ثَ' },
  { char: 'جُ', name: 'جيم ضمة جُ' },
  { char: 'حِ', name: 'حاء كسرة حِ' },
  { char: 'دَ', name: 'دال فتحة دَ' },
  { char: 'رُ', name: 'راء ضمة رُ' },
  { char: 'سِ', name: 'سين كسرة سِ' },
  { char: 'شَ', name: 'شين فتحة شَ' },
  { char: 'صُ', name: 'صاد ضمة صُ' },
  { char: 'طِ', name: 'طاء كسرة طِ' },
  { char: 'مَ', name: 'ميم فتحة مَ' },
  { char: 'نُ', name: 'نون ضمة نُ' },
  { char: 'يِ', name: 'ياء كسرة يِ' },
];

// French Alphabet letter names for speech clarity
export const FRENCH_ALPHABET: Array<{ char: string; name: string }> = [
  { char: 'A', name: 'A' },
  { char: 'B', name: 'Bé' },
  { char: 'C', name: 'Cé' },
  { char: 'D', name: 'Dé' },
  { char: 'E', name: 'E' },
  { char: 'F', name: 'Eff' },
  { char: 'G', name: 'Gé' },
  { char: 'H', name: 'Hache' },
  { char: 'I', name: 'I' },
  { char: 'J', name: 'Ji' },
  { char: 'K', name: 'Ka' },
  { char: 'L', name: 'Ell' },
  { char: 'M', name: 'Emm' },
  { char: 'N', name: 'Enn' },
  { char: 'O', name: 'O' },
  { char: 'P', name: 'Pé' },
  { char: 'Q', name: 'Ku' },
  { char: 'R', name: 'Err' },
  { char: 'S', name: 'Ess' },
  { char: 'T', name: 'Té' },
  { char: 'U', name: 'U' },
  { char: 'V', name: 'Vé' },
  { char: 'W', name: 'Double Vé' },
  { char: 'X', name: 'Iks' },
  { char: 'Y', name: 'I Grec' },
  { char: 'Z', name: 'Zède' },
];

// French Accents for Hard mode
export const FRENCH_ACCENTS: Array<{ char: string; name: string }> = [
  { char: 'É', name: 'E accent aigu' },
  { char: 'È', name: 'E accent grave' },
  { char: 'Ê', name: 'E accent circonflexe' },
  { char: 'Ë', name: 'E tréma' },
  { char: 'À', name: 'A accent grave' },
  { char: 'Ç', name: 'Cédille' },
  { char: 'Ô', name: 'O accent circonflexe' },
  { char: 'Î', name: 'I accent circonflexe' },
  { char: 'Ù', name: 'U accent grave' },
];

// English Alphabet
export const ENGLISH_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Arabic Number Word pronunciations
const ARABIC_NUMBER_WORDS: Record<number, string> = {
  0: 'صفر',
  1: 'واحد',
  2: 'اثنان',
  3: 'ثلاثة',
  4: 'أربعة',
  5: 'خمسة',
  6: 'ستة',
  7: 'سبعة',
  8: 'ثمانية',
  9: 'تسعة',
  10: 'عشرة',
  11: 'أحد عشر',
  12: 'اثنا عشر',
  13: 'ثلاثة عشر',
  14: 'أربعة عشر',
  15: 'خمسة عشر',
  16: 'ستة عشر',
  17: 'سبعة عشر',
  18: 'ثمانية عشر',
  19: 'تسعة عشر',
  20: 'عشرون',
  30: 'ثلاثون',
  40: 'أربعون',
  50: 'خمسون',
  60: 'ستون',
  70: 'سبعون',
  80: 'ثمانون',
  90: 'تسعون',
  100: 'مائة',
};

export function getArabicNumberSpoken(num: number): string {
  if (ARABIC_NUMBER_WORDS[num]) return ARABIC_NUMBER_WORDS[num];
  if (num < 100) {
    const ones = num % 10;
    const tens = Math.floor(num / 10) * 10;
    if (ones === 0) return ARABIC_NUMBER_WORDS[tens] || String(num);
    return `${ARABIC_NUMBER_WORDS[ones]} و ${ARABIC_NUMBER_WORDS[tens]}`;
  }
  return String(num);
}

// Convert western digits 1-9 to Arabic-Indic digits if desired
export function toEasternArabicDigits(num: number | string): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => digits[parseInt(d, 10)]);
}
