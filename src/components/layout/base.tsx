import { html } from "hono/html";
import { JSXNode } from "hono/jsx";

type Children = string | number | JSXNode | Children[];

export function BaseHtml({ children }: { children: Children }) {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>not THE BETH STACK</title>
        <script src="https://unpkg.com/htmx.org@1.9.5"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.11"></script>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      ${children}
    </html>
  `;
}
