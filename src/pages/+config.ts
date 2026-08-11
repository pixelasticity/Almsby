import vikeReact from "vike-react/config";
import type { Config } from "vike/types";

export default {
  // vike-react provides Vike's React hooks (+onRenderHtml / +onRenderClient,
  // <Layout>, <Head>, useData, ...) and the React/SSR settings.
  extends: [vikeReact],
  prerender: true,
  lang: "en",
  title: "Almsby — Every product has a story",
} satisfies Config;