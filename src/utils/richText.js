const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const bareUrlRegex = /(https?:\/\/[^\s]+)/g;

export const normalizeHref = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (text.includes("@") && !text.startsWith("mailto:") && !text.includes("://")) {
    return `mailto:${text}`;
  }
  if (text.startsWith("http://") || text.startsWith("https://") || text.startsWith("mailto:")) {
    return text;
  }
  return `https://${text}`;
};

const replaceMarkdownLinks = (text) => {
  const nodes = [];
  let last = 0;
  let match;
  while ((match = markdownLinkRegex.exec(text)) !== null) {
    if (match.index > last) nodes.push({ type: "text", value: text.slice(last, match.index) });
    nodes.push({ type: "link", text: match[1], href: match[2] });
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push({ type: "text", value: text.slice(last) });
  return nodes.length > 0 ? nodes : [{ type: "text", value: text }];
};

const replaceBareUrls = (nodes) =>
  nodes.flatMap((node) => {
    if (node.type !== "text") return [node];
    const chunks = [];
    let last = 0;
    let match;
    while ((match = bareUrlRegex.exec(node.value)) !== null) {
      if (match.index > last) chunks.push({ type: "text", value: node.value.slice(last, match.index) });
      chunks.push({ type: "link", text: match[1], href: match[1] });
      last = match.index + match[0].length;
    }
    if (last < node.value.length) chunks.push({ type: "text", value: node.value.slice(last) });
    return chunks.length > 0 ? chunks : [node];
  });

export const parseRichInlineText = (value) => {
  const text = String(value ?? "");
  const boldParts = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);
  const result = [];

  boldParts.forEach((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      result.push({
        type: "bold",
        children: replaceBareUrls(replaceMarkdownLinks(part.slice(2, -2)))
      });
      return;
    }
    result.push(...replaceBareUrls(replaceMarkdownLinks(part)));
  });

  return result;
};
