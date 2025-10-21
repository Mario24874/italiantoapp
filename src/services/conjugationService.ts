import { VerbConjugation, VerbTense } from '../types';

export class ConjugationService {
  private static irregularVerbs: Record<string, Record<VerbTense, any>> = {
    // Essere (to be)
    'essere': {
      presente: { io: 'sono', tu: 'sei', lui_lei: 'è', noi: 'siamo', voi: 'siete', loro: 'sono' },
      passatoProssimo: { io: 'sono stato/a', tu: 'sei stato/a', lui_lei: 'è stato/a', noi: 'siamo stati/e', voi: 'siete stati/e', loro: 'sono stati/e' },
      imperfetto: { io: 'ero', tu: 'eri', lui_lei: 'era', noi: 'eravamo', voi: 'eravate', loro: 'erano' },
      futuroSemplice: { io: 'sarò', tu: 'sarai', lui_lei: 'sarà', noi: 'saremo', voi: 'sarete', loro: 'saranno' },
      condizionale: { io: 'sarei', tu: 'saresti', lui_lei: 'sarebbe', noi: 'saremmo', voi: 'sareste', loro: 'sarebbero' },
      congiuntivo: { io: 'sia', tu: 'sia', lui_lei: 'sia', noi: 'siamo', voi: 'siate', loro: 'siano' }
    },
    
    // Avere (to have)
    'avere': {
      presente: { io: 'ho', tu: 'hai', lui_lei: 'ha', noi: 'abbiamo', voi: 'avete', loro: 'hanno' },
      passatoProssimo: { io: 'ho avuto', tu: 'hai avuto', lui_lei: 'ha avuto', noi: 'abbiamo avuto', voi: 'avete avuto', loro: 'hanno avuto' },
      imperfetto: { io: 'avevo', tu: 'avevi', lui_lei: 'aveva', noi: 'avevamo', voi: 'avevate', loro: 'avevano' },
      futuroSemplice: { io: 'avrò', tu: 'avrai', lui_lei: 'avrà', noi: 'avremo', voi: 'avrete', loro: 'avranno' },
      condizionale: { io: 'avrei', tu: 'avresti', lui_lei: 'avrebbe', noi: 'avremmo', voi: 'avreste', loro: 'avrebbero' },
      congiuntivo: { io: 'abbia', tu: 'abbia', lui_lei: 'abbia', noi: 'abbiamo', voi: 'abbiate', loro: 'abbiano' }
    },

    // Andare (to go)
    'andare': {
      presente: { io: 'vado', tu: 'vai', lui_lei: 'va', noi: 'andiamo', voi: 'andate', loro: 'vanno' },
      passatoProssimo: { io: 'sono andato/a', tu: 'sei andato/a', lui_lei: 'è andato/a', noi: 'siamo andati/e', voi: 'siete andati/e', loro: 'sono andati/e' },
      imperfetto: { io: 'andavo', tu: 'andavi', lui_lei: 'andava', noi: 'andavamo', voi: 'andavate', loro: 'andavano' },
      futuroSemplice: { io: 'andrò', tu: 'andrai', lui_lei: 'andrà', noi: 'andremo', voi: 'andrete', loro: 'andranno' },
      condizionale: { io: 'andrei', tu: 'andresti', lui_lei: 'andrebbe', noi: 'andremmo', voi: 'andreste', loro: 'andrebbero' },
      congiuntivo: { io: 'vada', tu: 'vada', lui_lei: 'vada', noi: 'andiamo', voi: 'andiate', loro: 'vadano' }
    },

    // Fare (to do/make)
    'fare': {
      presente: { io: 'faccio', tu: 'fai', lui_lei: 'fa', noi: 'facciamo', voi: 'fate', loro: 'fanno' },
      passatoProssimo: { io: 'ho fatto', tu: 'hai fatto', lui_lei: 'ha fatto', noi: 'abbiamo fatto', voi: 'avete fatto', loro: 'hanno fatto' },
      imperfetto: { io: 'facevo', tu: 'facevi', lui_lei: 'faceva', noi: 'facevamo', voi: 'facevate', loro: 'facevano' },
      futuroSemplice: { io: 'farò', tu: 'farai', lui_lei: 'farà', noi: 'faremo', voi: 'farete', loro: 'faranno' },
      condizionale: { io: 'farei', tu: 'faresti', lui_lei: 'farebbe', noi: 'faremmo', voi: 'fareste', loro: 'farebbero' },
      congiuntivo: { io: 'faccia', tu: 'faccia', lui_lei: 'faccia', noi: 'facciamo', voi: 'facciate', loro: 'facciano' }
    },

    // Dire (to say)
    'dire': {
      presente: { io: 'dico', tu: 'dici', lui_lei: 'dice', noi: 'diciamo', voi: 'dite', loro: 'dicono' },
      passatoProssimo: { io: 'ho detto', tu: 'hai detto', lui_lei: 'ha detto', noi: 'abbiamo detto', voi: 'avete detto', loro: 'hanno detto' },
      imperfetto: { io: 'dicevo', tu: 'dicevi', lui_lei: 'diceva', noi: 'dicevamo', voi: 'dicevate', loro: 'dicevano' },
      futuroSemplice: { io: 'dirò', tu: 'dirai', lui_lei: 'dirà', noi: 'diremo', voi: 'direte', loro: 'diranno' },
      condizionale: { io: 'direi', tu: 'diresti', lui_lei: 'direbbe', noi: 'diremmo', voi: 'direste', loro: 'direbbero' },
      congiuntivo: { io: 'dica', tu: 'dica', lui_lei: 'dica', noi: 'diciamo', voi: 'diciate', loro: 'dicano' }
    },

    // Stare (to stay/be)
    'stare': {
      presente: { io: 'sto', tu: 'stai', lui_lei: 'sta', noi: 'stiamo', voi: 'state', loro: 'stanno' },
      passatoProssimo: { io: 'sono stato/a', tu: 'sei stato/a', lui_lei: 'è stato/a', noi: 'siamo stati/e', voi: 'siete stati/e', loro: 'sono stati/e' },
      imperfetto: { io: 'stavo', tu: 'stavi', lui_lei: 'stava', noi: 'stavamo', voi: 'stavate', loro: 'stavano' },
      futuroSemplice: { io: 'starò', tu: 'starai', lui_lei: 'starà', noi: 'staremo', voi: 'starete', loro: 'staranno' },
      condizionale: { io: 'starei', tu: 'staresti', lui_lei: 'starebbe', noi: 'staremmo', voi: 'stareste', loro: 'starebbero' },
      congiuntivo: { io: 'stia', tu: 'stia', lui_lei: 'stia', noi: 'stiamo', voi: 'stiate', loro: 'stiano' }
    },

    // Dare (to give)
    'dare': {
      presente: { io: 'do', tu: 'dai', lui_lei: 'dà', noi: 'diamo', voi: 'date', loro: 'danno' },
      passatoProssimo: { io: 'ho dato', tu: 'hai dato', lui_lei: 'ha dato', noi: 'abbiamo dato', voi: 'avete dato', loro: 'hanno dato' },
      imperfetto: { io: 'davo', tu: 'davi', lui_lei: 'dava', noi: 'davamo', voi: 'davate', loro: 'davano' },
      futuroSemplice: { io: 'darò', tu: 'darai', lui_lei: 'darà', noi: 'daremo', voi: 'darete', loro: 'daranno' },
      condizionale: { io: 'darei', tu: 'daresti', lui_lei: 'darebbe', noi: 'daremmo', voi: 'dareste', loro: 'darebbero' },
      congiuntivo: { io: 'dia', tu: 'dia', lui_lei: 'dia', noi: 'diamo', voi: 'diate', loro: 'diano' }
    },

    // Sapere (to know)
    'sapere': {
      presente: { io: 'so', tu: 'sai', lui_lei: 'sa', noi: 'sappiamo', voi: 'sapete', loro: 'sanno' },
      passatoProssimo: { io: 'ho saputo', tu: 'hai saputo', lui_lei: 'ha saputo', noi: 'abbiamo saputo', voi: 'avete saputo', loro: 'hanno saputo' },
      imperfetto: { io: 'sapevo', tu: 'sapevi', lui_lei: 'sapeva', noi: 'sapevamo', voi: 'sapevate', loro: 'sapevano' },
      futuroSemplice: { io: 'saprò', tu: 'saprai', lui_lei: 'saprà', noi: 'sapremo', voi: 'saprete', loro: 'sapranno' },
      condizionale: { io: 'saprei', tu: 'sapresti', lui_lei: 'saprebbe', noi: 'sapremmo', voi: 'sapreste', loro: 'saprebbero' },
      congiuntivo: { io: 'sappia', tu: 'sappia', lui_lei: 'sappia', noi: 'sappiamo', voi: 'sappiate', loro: 'sappiano' }
    },

    // Dovere (must/have to)
    'dovere': {
      presente: { io: 'devo', tu: 'devi', lui_lei: 'deve', noi: 'dobbiamo', voi: 'dovete', loro: 'devono' },
      passatoProssimo: { io: 'ho dovuto', tu: 'hai dovuto', lui_lei: 'ha dovuto', noi: 'abbiamo dovuto', voi: 'avete dovuto', loro: 'hanno dovuto' },
      imperfetto: { io: 'dovevo', tu: 'dovevi', lui_lei: 'doveva', noi: 'dovevamo', voi: 'dovevate', loro: 'dovevano' },
      futuroSemplice: { io: 'dovrò', tu: 'dovrai', lui_lei: 'dovrà', noi: 'dovremo', voi: 'dovrete', loro: 'dovranno' },
      condizionale: { io: 'dovrei', tu: 'dovresti', lui_lei: 'dovrebbe', noi: 'dovremmo', voi: 'dovreste', loro: 'dovrebbero' },
      congiuntivo: { io: 'debba', tu: 'debba', lui_lei: 'debba', noi: 'dobbiamo', voi: 'dobbiate', loro: 'debbano' }
    },

    // Potere (can/be able to)
    'potere': {
      presente: { io: 'posso', tu: 'puoi', lui_lei: 'può', noi: 'possiamo', voi: 'potete', loro: 'possono' },
      passatoProssimo: { io: 'ho potuto', tu: 'hai potuto', lui_lei: 'ha potuto', noi: 'abbiamo potuto', voi: 'avete potuto', loro: 'hanno potuto' },
      imperfetto: { io: 'potevo', tu: 'potevi', lui_lei: 'poteva', noi: 'potevamo', voi: 'potevate', loro: 'potevano' },
      futuroSemplice: { io: 'potrò', tu: 'potrai', lui_lei: 'potrà', noi: 'potremo', voi: 'potrete', loro: 'potranno' },
      condizionale: { io: 'potrei', tu: 'potresti', lui_lei: 'potrebbe', noi: 'potremmo', voi: 'potreste', loro: 'potrebbero' },
      congiuntivo: { io: 'possa', tu: 'possa', lui_lei: 'possa', noi: 'possiamo', voi: 'possiate', loro: 'possano' }
    },

    // Volere (to want)
    'volere': {
      presente: { io: 'voglio', tu: 'vuoi', lui_lei: 'vuole', noi: 'vogliamo', voi: 'volete', loro: 'vogliono' },
      passatoProssimo: { io: 'ho voluto', tu: 'hai voluto', lui_lei: 'ha voluto', noi: 'abbiamo voluto', voi: 'avete voluto', loro: 'hanno voluto' },
      imperfetto: { io: 'volevo', tu: 'volevi', lui_lei: 'voleva', noi: 'volevamo', voi: 'volevate', loro: 'volevano' },
      futuroSemplice: { io: 'vorrò', tu: 'vorrai', lui_lei: 'vorrà', noi: 'vorremo', voi: 'vorrete', loro: 'vorranno' },
      condizionale: { io: 'vorrei', tu: 'vorresti', lui_lei: 'vorrebbe', noi: 'vorremmo', voi: 'vorreste', loro: 'vorrebbero' },
      congiuntivo: { io: 'voglia', tu: 'voglia', lui_lei: 'voglia', noi: 'vogliamo', voi: 'vogliate', loro: 'vogliano' }
    },

    // Venire (to come)
    'venire': {
      presente: { io: 'vengo', tu: 'vieni', lui_lei: 'viene', noi: 'veniamo', voi: 'venite', loro: 'vengono' },
      passatoProssimo: { io: 'sono venuto/a', tu: 'sei venuto/a', lui_lei: 'è venuto/a', noi: 'siamo venuti/e', voi: 'siete venuti/e', loro: 'sono venuti/e' },
      imperfetto: { io: 'venivo', tu: 'venivi', lui_lei: 'veniva', noi: 'venivamo', voi: 'venivate', loro: 'venivano' },
      futuroSemplice: { io: 'verrò', tu: 'verrai', lui_lei: 'verrà', noi: 'verremo', voi: 'verrete', loro: 'verranno' },
      condizionale: { io: 'verrei', tu: 'verresti', lui_lei: 'verrebbe', noi: 'verremmo', voi: 'verreste', loro: 'verrebbero' },
      congiuntivo: { io: 'venga', tu: 'venga', lui_lei: 'venga', noi: 'veniamo', voi: 'veniate', loro: 'vengano' }
    },

    // Bere (to drink)
    'bere': {
      presente: { io: 'bevo', tu: 'bevi', lui_lei: 'beve', noi: 'beviamo', voi: 'bevete', loro: 'bevono' },
      passatoProssimo: { io: 'ho bevuto', tu: 'hai bevuto', lui_lei: 'ha bevuto', noi: 'abbiamo bevuto', voi: 'avete bevuto', loro: 'hanno bevuto' },
      imperfetto: { io: 'bevevo', tu: 'bevevi', lui_lei: 'beveva', noi: 'bevevamo', voi: 'bevevate', loro: 'bevevano' },
      futuroSemplice: { io: 'berrò', tu: 'berrai', lui_lei: 'berrà', noi: 'berremo', voi: 'berrete', loro: 'berranno' },
      condizionale: { io: 'berrei', tu: 'berresti', lui_lei: 'berrebbe', noi: 'berremmo', voi: 'berreste', loro: 'berrebbero' },
      congiuntivo: { io: 'beva', tu: 'beva', lui_lei: 'beva', noi: 'beviamo', voi: 'beviate', loro: 'bevano' }
    },

    // Uscire (to go out)
    'uscire': {
      presente: { io: 'esco', tu: 'esci', lui_lei: 'esce', noi: 'usciamo', voi: 'uscite', loro: 'escono' },
      passatoProssimo: { io: 'sono uscito/a', tu: 'sei uscito/a', lui_lei: 'è uscito/a', noi: 'siamo usciti/e', voi: 'siete usciti/e', loro: 'sono usciti/e' },
      imperfetto: { io: 'uscivo', tu: 'uscivi', lui_lei: 'usciva', noi: 'uscivamo', voi: 'uscivate', loro: 'uscivano' },
      futuroSemplice: { io: 'uscirò', tu: 'uscirai', lui_lei: 'uscirà', noi: 'usciremo', voi: 'uscirete', loro: 'usciranno' },
      condizionale: { io: 'uscirei', tu: 'usciresti', lui_lei: 'uscirebbe', noi: 'usciremmo', voi: 'uscireste', loro: 'uscirebbero' },
      congiuntivo: { io: 'esca', tu: 'esca', lui_lei: 'esca', noi: 'usciamo', voi: 'usciate', loro: 'escano' }
    },

    // Tradurre (to translate)
    'tradurre': {
      presente: { io: 'traduco', tu: 'traduci', lui_lei: 'traduce', noi: 'traduciamo', voi: 'traducete', loro: 'traducono' },
      passatoProssimo: { io: 'ho tradotto', tu: 'hai tradotto', lui_lei: 'ha tradotto', noi: 'abbiamo tradotto', voi: 'avete tradotto', loro: 'hanno tradotto' },
      imperfetto: { io: 'traducevo', tu: 'traducevi', lui_lei: 'traduceva', noi: 'traducevamo', voi: 'traducevate', loro: 'traducevano' },
      futuroSemplice: { io: 'tradurrò', tu: 'tradurrai', lui_lei: 'tradurrà', noi: 'tradurremo', voi: 'tradurrete', loro: 'tradurranno' },
      condizionale: { io: 'tradurrei', tu: 'tradurresti', lui_lei: 'tradurrebbe', noi: 'tradurremmo', voi: 'tradurreste', loro: 'tradurrebbero' },
      congiuntivo: { io: 'traduca', tu: 'traduca', lui_lei: 'traduca', noi: 'traduciamo', voi: 'traduciate', loro: 'traducano' }
    },

    // Porre (to put)
    'porre': {
      presente: { io: 'pongo', tu: 'poni', lui_lei: 'pone', noi: 'poniamo', voi: 'ponete', loro: 'pongono' },
      passatoProssimo: { io: 'ho posto', tu: 'hai posto', lui_lei: 'ha posto', noi: 'abbiamo posto', voi: 'avete posto', loro: 'hanno posto' },
      imperfetto: { io: 'ponevo', tu: 'ponevi', lui_lei: 'poneva', noi: 'ponevamo', voi: 'ponevate', loro: 'ponevano' },
      futuroSemplice: { io: 'porrò', tu: 'porrai', lui_lei: 'porrà', noi: 'porremo', voi: 'porrete', loro: 'porranno' },
      condizionale: { io: 'porrei', tu: 'porresti', lui_lei: 'porrebbe', noi: 'porremmo', voi: 'porreste', loro: 'porrebbero' },
      congiuntivo: { io: 'ponga', tu: 'ponga', lui_lei: 'ponga', noi: 'poniamo', voi: 'poniate', loro: 'pongano' }
    }
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

  private static isReflexive(verb: string): boolean {
    return verb.endsWith('si') || verb.includes('si ');
  }

  private static getBaseVerb(verb: string): string {
    if (this.isReflexive(verb)) {
      if (verb.endsWith('si')) {
        return verb.slice(0, -2);
      }
      return verb.replace('si ', '');
    }
    return verb;
  }

  static conjugate(verb: string, tense: VerbTense): VerbConjugation {
    try {
      const originalVerb = verb.toLowerCase().trim();
      const isReflexive = this.isReflexive(originalVerb);
      const baseVerb = this.getBaseVerb(originalVerb);
      
      // Verificar si es un verbo irregular
      if (this.irregularVerbs[baseVerb]) {
        const conjugations = this.irregularVerbs[baseVerb][tense];
        if (isReflexive) {
          return this.addReflexivePronouns(baseVerb, tense, conjugations);
        }
        return {
          verb: originalVerb,
          tense,
          conjugations
        };
      }

      // Conjugación regular
      const ending = this.getVerbEnding(baseVerb);
      const stem = this.getVerbStem(baseVerb);

      if (!ending) {
        throw new Error(`Il verbo "${originalVerb}" non è riconosciuto. Supportiamo verbi che terminano in -are, -ere, -ire e verbi irregolari comuni.`);
      }

      const conjugations = this.getConjugations(stem, ending, tense);
      
      if (isReflexive) {
        return this.addReflexivePronouns(baseVerb, tense, conjugations);
      }

      return {
        verb: originalVerb,
        tense,
        conjugations
      };
    } catch (error) {
      throw new Error(`Errore nella coniugazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  private static addReflexivePronouns(verb: string, tense: VerbTense, conjugations: any): VerbConjugation {
    const reflexivePronouns = {
      io: 'mi',
      tu: 'ti', 
      lui_lei: 'si',
      noi: 'ci',
      voi: 'vi',
      loro: 'si'
    };

    const reflexiveConjugations: any = {};
    
    for (const [pronoun, conjugation] of Object.entries(conjugations)) {
      const reflexivePronoun = reflexivePronouns[pronoun as keyof typeof reflexivePronouns];
      reflexiveConjugations[pronoun] = `${reflexivePronoun} ${conjugation}`;
    }

    return {
      verb: verb + 'si',
      tense,
      conjugations: reflexiveConjugations
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