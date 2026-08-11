import "@/styles/index.css";
import type { ReactNode } from "react";

export default Layout;

function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <HiddenNetlifyForm />
      {children}
    </>
  );
}

// Hidden Netlify Forms registration form — lets Netlify detect the SPA form
// in the prerendered HTML at deploy time. The form name must stay
// "coming-soon" to match NETLIFY_FORM_NAME in src/app/App.tsx.
// Rendered via dangerouslySetInnerHTML so the exact static markup that used
// to live in index.html ships byte-for-byte (Netlify reads the attribute
// names literally, e.g. data-netlify and netlify-honeypot).
function HiddenNetlifyForm() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: [
          '<form name="coming-soon" data-netlify="true" netlify-honeypot="bot-field" hidden>',
          '  <input type="hidden" name="form-name" value="coming-soon" />',
          '  <input type="email" name="email" />',
          '  <input type="text" name="bot-field" />',
          "</form>",
        ].join("\n"),
      }}
    />
  );
}