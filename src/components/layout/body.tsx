import { html } from "hono/html";

export const Body = ({ children }: { children: any }) => html`
  <body class="container m-auto">
    ${children}
  </body>
`;
