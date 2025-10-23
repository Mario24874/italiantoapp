export interface Translation {
  from: string;
  to: string;
  text: string;
  translatedText: string;
}

export interface VerbConjugation {
  verb: string;
  tense: string;
  conjugations: {
    io: string;
    tu: string;
    lui_lei: string;
    noi: string;
    voi: string;
    loro: string;
  };
}

export interface PronunciationResult {
  word: string;
  userPronunciation: string;
  score: number;
  feedback: string;
}

export type Language = 'es' | 'en' | 'it';
export type VerbTense = 'presente' | 'passatoProssimo' | 'imperfetto' | 'futuroSemplice' | 'condizionale' | 'congiuntivo';