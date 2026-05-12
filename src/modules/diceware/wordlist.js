// Re-exporta la EFF long wordlist (7776 palabras) desde @zxcvbn-ts/language-common.
// Módulo separado para que esbuild lo emita como chunk lazy.
import WORDLIST from '@zxcvbn-ts/language-common/src/diceware.json';
export { WORDLIST };
