import postcss, { type AtRule, type Container, type Rule } from "postcss";

/** Escape a single Tailwind class for use in a compound selector (`.a.b.c`). */
export function escapeTailwindClassForSelector(className: string): string {
  return CSS.escape(className);
}

/** Join Tailwind class strings into a compound selector with proper escaping. */
export function tailwindCompoundSelector(classString: string): string {
  const parts = classString.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  return parts.map((c) => `.${escapeTailwindClassForSelector(c)}`).join("");
}

export function tokenizeTailwindClasses(...classStrings: string[]): string[] {
  const set = new Set<string>();
  for (const s of classStrings) {
    for (const c of s.trim().split(/\s+/)) {
      if (c) set.add(c);
    }
  }
  return [...set];
}

/** How class names appear inside compiled Tailwind selectors. */
function classNeedle(className: string): string {
  return `.${className.replace(/:/g, "\\:").replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\./g, "\\.").replace(/\//g, "\\/")}`;
}

function selectorReferencesClass(selector: string, className: string): boolean {
  const needle = classNeedle(className);
  const parts = selector.split(/[\s,>+~]+/).filter(Boolean);
  return parts.some((part) => part === needle);
}

function ruleMatchesClasses(rule: Rule, classNames: Set<string>): boolean {
  return rule.selectors.some((sel) => {
    for (const c of classNames) {
      if (selectorReferencesClass(sel, c)) return true;
    }
    return false;
  });
}

function collectVarNames(cssText: string): Set<string> {
  const vars = new Set<string>();
  const re = /var\((--[a-zA-Z0-9-_]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cssText))) vars.add(m[1]);
  return vars;
}

function extractRootCustomProperties(css: string, varNames: Set<string>): string {
  if (varNames.size === 0) return "";
  const root = postcss.parse(css);
  const needed = new Set(varNames);
  const decls: string[] = [];

  root.walkRules((rule) => {
    if (!rule.selectors.some((s) => s === ":root" || s.includes(":root"))) return;
    rule.walkDecls((decl) => {
      if (needed.has(decl.prop)) {
        decls.push(`${decl.prop}:${decl.value}`);
        needed.delete(decl.prop);
      }
    });
  });

  if (decls.length === 0) return "";
  return `:root{${decls.join(";")}}`;
}

function walkContainer(node: Container, classNames: Set<string>, out: string[], seen: Set<string>): void {
  node.each((child) => {
    if (child.type === "rule") {
      const rule = child as Rule;
      if (ruleMatchesClasses(rule, classNames)) {
        const text = rule.toString();
        if (!seen.has(text)) {
          seen.add(text);
          out.push(text);
        }
      }
    } else if (child.type === "atrule") {
      const at = child as AtRule;
      if (at.name === "media" || at.name === "supports") {
        const matched: Rule[] = [];
        at.walkRules((rule) => {
          if (ruleMatchesClasses(rule, classNames)) matched.push(rule);
        });
        if (matched.length) {
          const clone = at.clone();
          clone.removeAll();
          for (const rule of matched) clone.append(rule.clone());
          const text = clone.toString();
          if (!seen.has(text)) {
            seen.add(text);
            out.push(text);
          }
        }
      }
    }
  });
}

/**
 * Pull utility rules for the given class names from compiled Tailwind CSS,
 * plus :root custom properties those rules reference.
 */
export function extractTailwindRulesForClasses(compiledCss: string, classNames: string[]): string {
  const classSet = new Set(classNames);
  const rulesOut: string[] = [];
  const seen = new Set<string>();
  const root = postcss.parse(compiledCss);

  walkContainer(root, classSet, rulesOut, seen);

  const utilities = rulesOut.join("\n");
  const vars = collectVarNames(utilities);
  const rootVars = extractRootCustomProperties(compiledCss, vars);

  return [rootVars, utilities].filter(Boolean).join("\n");
}

export function extractFontFaceRules(compiledCss: string, familySubstring = "Barlow"): string {
  const root = postcss.parse(compiledCss);
  const chunks: string[] = [];
  root.walkAtRules("font-face", (at) => {
    if (at.toString().includes(familySubstring)) chunks.push(at.toString());
  });
  return chunks.join("\n");
}