// Módulo pesado — se importa dinámicamente en el primer keystroke.
// Contiene zxcvbn-ts + diccionarios (~500 KB minificado, ~80 KB gzip).

import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import { adjacencyGraphs, dictionary as commonDict } from '@zxcvbn-ts/language-common';
// Solo traducciones de los packs de idioma (4 KB vs 1.5 MB de word lists completos).
// Los word lists de ES/EN se agregan en la próxima iteración con lazy-loading por lang.
import { translations as esTransRaw } from '@zxcvbn-ts/language-es-es';

// Bug en el paquete es-es: la sugerencia l33t dice "'@' por '@'" (ambos iguales).
const esTrans = {
  ...esTransRaw,
  suggestions: {
    ...esTransRaw.suggestions,
    l33t: "Evita sustituciones predecibles (como '@' en lugar de 'a').",
  },
};
import { translations as enTrans } from '@zxcvbn-ts/language-en';
import { wordlist as coneSurList } from './wordlist-cone-sur.js';

export function configure(lang) {
  zxcvbnOptions.setOptions({
    translations:           lang === 'en' ? enTrans : esTrans,
    graphs:                 adjacencyGraphs,
    useLevenshteinDistance: true,
    dictionary: {
      ...commonDict,
      coneSur: coneSurList,
    },
  });
}

export function analyze(password) {
  return zxcvbn(password);
}
