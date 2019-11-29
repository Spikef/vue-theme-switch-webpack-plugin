/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
export default function listToStyles(parentId, list) {
  const styles = [];
  const newStyles = {};
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const id = item[0];
    const css = item[1];
    const media = item[2];
    const sourceMap = item[3];
    const part = {
      id: `${parentId}:${i}`,
      css,
      media,
      sourceMap,
    };
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id, parts: [part] });
    } else {
      newStyles[id].parts.push(part);
    }
  }
  return styles;
}
