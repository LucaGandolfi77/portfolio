/* Pure story data and typewriter helper */
import { REALMS } from '../config.js';

export function chapterLines(index, lang = 'en') {
  const name = REALMS[index][lang];
  return lang === 'it'
    ? [
        `Capitolo ${index + 1}: ${name}.`,
        REALMS[index].itStory,
        'Tocca il mondo per guidare Luma. Le stelle brillano dove la luce è più debole.'
      ]
    : [
        `Chapter ${index + 1}: ${name}.`,
        REALMS[index].enStory,
        'Tap the world to guide Luma. Stars shine where the light is faintest.'
      ];
}
export function starLine(lang = 'en') {
  return lang === 'it'
    ? 'Una stella si posa nella lanterna di Luma. Il cielo si fa un po’ più luminoso.'
    : 'A star settles into Luma’s lantern. The sky grows a little brighter.';
}
export function spiritLine(index, lang = 'en') {
  const name = REALMS[index][lang];
  return lang === 'it'
    ? `Lo spirito del ${name} si sveglia. Non era perduto: aspettava solo qualcuno che lo riconoscesse.`
    : `The spirit of ${name} awakens. It was never lost — only waiting for someone to recognise it.`;
}
export function travelLine(index, lang = 'en') {
  const name = REALMS[index][lang];
  return lang === 'it' ? `Il cielo cambia… Luma entra nel ${name}.` : `The sky shifts… Luma enters ${name}.`;
}
export function finale(lang = 'en') {
  return lang === 'it'
    ? 'Il cielo è di nuovo intero. Luma è la nuova guardiana dell’Alba Celeste.'
    : 'The sky is whole again. Luma is the new guardian of the Celestial Dawn.';
}
export function typed(text, elapsed, cps = 42) {
  return String(text).slice(0, Math.max(0, Math.floor(elapsed * cps)));
}
