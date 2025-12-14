import { vars } from "@/db/lib/vars";
import { Variable } from "@/db/types";
import { useEffect } from "react";
import { generateOpacityHex } from "../lib/generateOpacityHex";
import { useLiveQuery } from "dexie-react-hooks";

function appendBaseStyle() {
  let baseStyle = document.getElementById("ck-styles-base");
  if (!baseStyle) baseStyle = document.createElement("style");

  baseStyle.id = "ck-styles-base";
  baseStyle.innerHTML = `
      @layer base {
        div, section {
          display: flex;
          flex-direction: column;
          align-items: start;
        }
      }
    `;
  document.head.appendChild(baseStyle);

  return () => {
    document.head.removeChild(document.getElementById("ck-styles-base")!);
  };
}

function appendTailwindCSS() {
  if (document.getElementById("ck-styles-tailwind")) {
    document.head.removeChild(document.getElementById("ck-styles-tailwind")!);
  }

  const tailwindCSSScript = document.createElement("script");
  tailwindCSSScript.id = "ck-styles-tailwind";
  tailwindCSSScript.src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
  document.head.appendChild(tailwindCSSScript);

  return () => {
    document.head.removeChild(document.getElementById("ck-styles-tailwind")!);
  };
}

function appendVariables(variables: Variable[]) {
  const returnFn = () => {
    document.head.removeChild(document.getElementById("ck-styles-variables")!);
  };

  let variableStyles = document.getElementById(
    "ck-styles-variables"
  ) as HTMLStyleElement | null;
  if (!variableStyles) variableStyles = document.createElement("style");

  if (!variableStyles) return returnFn;
  variableStyles.id = "ck-styles-variables";
  variableStyles.type = "text/tailwindcss";
  variableStyles.innerHTML = `
      @theme inline {
        ${variables?.map((v) => `--${v.type === "color" ? "color-" : ""}${v.slug}: var(--${v.slug});`).join("\n")}
      }

      :root {
        ${variables?.map((v) => `--${v.slug}: ${parseVariable(v.value)};`).join("\n")}
      }
      `;

  document.head.appendChild(variableStyles);

  return returnFn;
}

export const useStyles = () => {
  const variables = useLiveQuery(() => vars.list(), []);
  useEffect(() => {
    const removeBaseStyle = appendBaseStyle();
    const removeTailwindCSS = appendTailwindCSS();
    const removeVariables = appendVariables(variables ?? []);

    return () => {
      removeBaseStyle();
      removeTailwindCSS();
      removeVariables();
    };
  }, [variables]);
};

function parseVariable(variable: Variable["value"]) {
  if (variable.type === "color") {
    return `${variable.value}${generateOpacityHex(variable.opacity)}`;
  }
  if (variable.type === "linear-gradient") {
    return `linear-gradient(${variable.colors.map((c) => `${c.value}${generateOpacityHex(c.opacity)}${c.position && c.position !== 100 ? `_${c.position}%` : ""}`).join(", ")})`;
  }
  if (variable.type === "radial-gradient") {
    return `radial-gradient(${variable.colors.map((c) => `${c.value}${generateOpacityHex(c.opacity)}${c.position && c.position !== 100 ? `_${c.position}%` : ""}`).join(", ")})`;
  }
  if (variable.type === "conic-gradient") {
    return `conic-gradient(${variable.colors.map((c) => `${c.value}${generateOpacityHex(c.opacity)}${c.position && c.position !== 100 ? `_${c.position}%` : ""}`).join(", ")})`;
  }
}
