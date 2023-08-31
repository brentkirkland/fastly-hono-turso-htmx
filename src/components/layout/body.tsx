import { html } from "hono/html";

export const Body = ({ children }: { children: any }) => html`
  <body class="flex w-full h-screen justify-center items-center">
    ${children}
  </body>
`;
