import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Document shell for static/server web output. The current single-page export
 * uses public/index.html for its home-screen metadata instead.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0D0B1C" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Chereka" />
        <link rel="manifest" href="/manifest.webmanifest?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png?v=2" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: darkCanvas }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const darkCanvas = `
html, body, #root {
  background-color: #0D0B1C;
}
/* Home-screen launch with a black-translucent status bar: iOS resolves 100%
   to the screen minus the status bar. 100vh is the full screen there. */
@media all and (display-mode: standalone) {
  html, body, #root {
    height: 100vh;
  }
}
#root {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
input, textarea, [contenteditable="true"] {
  -webkit-user-select: text;
  user-select: text;
  -webkit-touch-callout: default;
}
`;
