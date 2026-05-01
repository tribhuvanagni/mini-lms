import type { RefObject } from 'react';
import type WebView from 'react-native-webview';

export type WebMessage =
  | { type: 'SECTION_COMPLETE'; sectionIdx: number }
  | { type: 'SCROLL_PROGRESS'; percent: number }
  | { type: 'READY' }
  | { type: 'ERROR'; message: string };

export function buildInjectionScript(course: Record<string, unknown>): string {
  const json = JSON.stringify(course)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
  return `
    window.__COURSE__ = ${json};
    document.dispatchEvent(new Event('course-data-ready'));
    true;
  `;
}

export function parseWebMessage(raw: string): WebMessage | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'type' in parsed) {
      return parsed as WebMessage;
    }
    return null;
  } catch {
    return null;
  }
}

export function postToWeb(
  ref: RefObject<WebView | null>,
  payload: Record<string, unknown>
) {
  (ref.current as any)?.injectJavaScript(
    `window.dispatchEvent(new CustomEvent('native-message', { detail: ${JSON.stringify(payload)} })); true;`
  );
}
