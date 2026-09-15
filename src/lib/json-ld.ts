/** Serialize data without allowing HTML to terminate the surrounding script. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
