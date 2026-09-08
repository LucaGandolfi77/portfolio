/** Parser locale — .txt / .md base */
const Parser = {
  parse(text) { return `<p>${text.replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>')}</p>`; }
};
