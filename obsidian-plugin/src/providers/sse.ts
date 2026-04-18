/**
 * Minimal SSE parser — OpenAI-compatible.
 *
 * Consumes a ReadableStream<Uint8Array> from fetch() and yields each
 * complete `data: ...` line as a string. Hand-rolled to avoid pulling a
 * dependency just for this (keeps the plugin bundle lean).
 *
 * Caveats:
 *   - Events other than `data:` (e.g. `event:`, `id:`, `retry:`) are
 *     ignored; providers we target don't use them for payload transport.
 *   - `[DONE]` sentinel is yielded as-is; callers detect termination.
 */

export async function* parseSseStream(
  stream: ReadableStream<Uint8Array>,
  signal?: AbortSignal
): AsyncIterable<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const onAbort = (): void => {
    // Best-effort: cancel the underlying reader so upstream fetch unwinds.
    reader.cancel().catch(() => {
      /* already closed */
    });
  };
  if (signal) {
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
  }

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        // Flush any trailing data not followed by a blank line.
        const flushed = flushPending(buffer);
        buffer = "";
        for (const data of flushed) yield data;
        return;
      }

      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by a blank line. Split greedily.
      let sep = findEventSeparator(buffer);
      while (sep >= 0) {
        const rawEvent = buffer.substring(0, sep);
        buffer = buffer.substring(sep + separatorLength(buffer, sep));
        const data = extractDataPayload(rawEvent);
        if (data !== null) yield data;
        sep = findEventSeparator(buffer);
      }
    }
  } finally {
    if (signal) signal.removeEventListener("abort", onAbort);
    try {
      reader.releaseLock();
    } catch {
      /* already released */
    }
  }
}

function findEventSeparator(buf: string): number {
  // Accept either \n\n or \r\n\r\n (some servers send CRLF).
  const lf = buf.indexOf("\n\n");
  const crlf = buf.indexOf("\r\n\r\n");
  if (lf === -1) return crlf;
  if (crlf === -1) return lf;
  return Math.min(lf, crlf);
}

function separatorLength(buf: string, sep: number): number {
  return buf.substring(sep, sep + 4) === "\r\n\r\n" ? 4 : 2;
}

function extractDataPayload(rawEvent: string): string | null {
  // A single event may have multiple `data:` lines that concatenate with newlines per the SSE spec.
  const lines = rawEvent.split(/\r?\n/);
  const dataLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith("data:")) {
      // Strip the leading "data:" and one optional space.
      const payload = line.startsWith("data: ") ? line.substring(6) : line.substring(5);
      dataLines.push(payload);
    }
  }
  if (dataLines.length === 0) return null;
  return dataLines.join("\n");
}

function flushPending(buffer: string): string[] {
  const trimmed = buffer.trim();
  if (!trimmed) return [];
  const data = extractDataPayload(trimmed);
  return data === null ? [] : [data];
}
