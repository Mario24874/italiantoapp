import { VerbConjugation, VerbTense } from '../types';

export class ConjugationService {
  private static regularVerbs = {
    are: ['parlare', 'amare', 'cantare', 'mangiare', 'studiare'],
    ere: ['credere', 'vendere', 'ricevere', 'temere'],
    ire: ['dormire', 'partire', 'sentire', 'aprire']
  };

  private static getVerbEnding(verb: string): 'are' | 'ere' | 'ire' | null {
    if (verb.endsWith('are')) return 'are';
    if (verb.endsWith('ere')) return 'ere';
    if (verb.endsWith('ire')) return 'ire';
    return null;
  }

  private static getVerbStem(verb: string): string {
    return verb.slice(0, -3);
  }

  static conjugate(verb: string, tense: VerbTense): VerbConjugation {
    const ending = this.getVerbEnding(verb);
    const stem = this.getVerbStem(verb);

    if (!ending) {
      throw new Error('Verbo non valido');
    }

    const conjugations = this.getConjugations(stem, ending, tense);

    return {
      verb,
      tense,
      conjugations
    };
  }

  private static getConjugations(stem: string, ending: 'are' | 'ere' | 'ire', tense: VerbTense) {
    const conjugationPatterns = {
      presente: {
        are: { io: 'o', tu: 'i', lui_lei: 'a', noi: 'iamo', voi: 'ate', loro: 'ano' },
        ere: { io: 'o', tu: 'i', lui_lei: 'e', noi: 'iamo', voi: 'ete', loro: 'ono' },
        ire: { io: 'o', tu: 'i', lui_lei: 'e', noi: 'iamo', voi: 'ite', loro: 'ono' }
      },
      passatoProssimo: {
        are: { io: 'ho ' + stem + 'ato', tu: 'hai ' + stem + 'ato', lui_lei: 'ha ' + stem + 'ato', 
               noi: 'abbiamo ' + stem + 'ato', voi: 'avete ' + stem + 'ato', loro: 'hanno ' + stem + 'ato' },
        ere: { io: 'ho ' + stem + 'uto', tu: 'hai ' + stem + 'uto', lui_lei: 'ha ' + stem + 'uto', 
               noi: 'abbiamo ' + stem + 'uto', voi: 'avete ' + stem + 'uto', loro: 'hanno ' + stem + 'uto' },
        ire: { io: 'ho ' + stem + 'ito', tu: 'hai ' + stem + 'ito', lui_lei: 'ha ' + stem + 'ito', 
               noi: 'abbiamo ' + stem + 'ito', voi: 'avete ' + stem + 'ito', loro: 'hanno ' + stem + 'ito' }
      },
      imperfetto: {
        are: { io: 'avo', tu: 'avi', lui_lei: 'ava', noi: 'avamo', voi: 'avate', loro: 'avano' },
        ere: { io: 'evo', tu: 'evi', lui_lei: 'eva', noi: 'evamo', voi: 'evate', loro: 'evano' },
        ire: { io: 'ivo', tu: 'ivi', lui_lei: 'iva', noi: 'ivamo', voi: 'ivate', loro: 'ivano' }
      },
      futuroSemplice: {
        are: { io: 'erò', tu: 'erai', lui_lei: 'erà', noi: 'eremo', voi: 'erete', loro: 'eranno' },
        ere: { io: 'erò', tu: 'erai', lui_lei: 'erà', noi: 'eremo', voi: 'erete', loro: 'eranno' },
        ire: { io: 'irò', tu: 'irai', lui_lei: 'irà', noi: 'iremo', voi: 'irete', loro: 'iranno' }
      },
      condizionale: {
        are: { io: 'erei', tu: 'eresti', lui_lei: 'erebbe', noi: 'eremmo', voi: 'ereste', loro: 'erebbero' },
        ere: { io: 'erei', tu: 'eresti', lui_lei: 'erebbe', noi: 'eremmo', voi: 'ereste', loro: 'erebbero' },
        ire: { io: 'irei', tu: 'iresti', lui_lei: 'irebbe', noi: 'iremmo', voi: 'ireste', loro: 'irebbero' }
      },
      congiuntivo: {
        are: { io: 'i', tu: 'i', lui_lei: 'i', noi: 'iamo', voi: 'iate', loro: 'ino' },
        ere: { io: 'a', tu: 'a', lui_lei: 'a', noi: 'iamo', voi: 'iate', loro: 'ano' },
        ire: { io: 'a', tu: 'a', lui_lei: 'a', noi: 'iamo', voi: 'iate', loro: 'ano' }
      }
    };

    const pattern = conjugationPatterns[tense][ending];
    
    if (tense === 'passatoProssimo') {
      return pattern;
    }

    return {
      io: stem + pattern.io,
      tu: stem + pattern.tu,
      lui_lei: stem + pattern.lui_lei,
      noi: stem + pattern.noi,
      voi: stem + pattern.voi,
      loro: stem + pattern.loro
    };
  }
}