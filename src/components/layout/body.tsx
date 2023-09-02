import { html } from "hono/html";

export const Body = ({ children }: { children: any }) => html`
  <body class="container m-auto dark:bg-black dark:text-white">
    ${children}
  </body>
`;
