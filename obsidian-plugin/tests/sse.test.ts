// SPDX-License-Identifier: MIT
import { describe, expect, test } from "bun:test";
import { parseSseStream } from "../src/providers/sse";

function streamFromString(s: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(s);
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

function chunkedStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c));
      controller.close();
    },
  });
}

async function collect(iter: AsyncIterable<string>): Promise<string[]> {
  const out: string[] = [];
  for await (const v of iter) out.push(v);
  return out;
}

describe("parseSseStream", () => {
  test("yields single-line data payloads", async () => {
    const stream = streamFromString(`data: hello\n\ndata: world\n\n`);
    expect(await collect(parseSseStream(stream))).toEqual(["hello", "world"]);
  });

  test("handles CRLF line endings", async () => {
    const stream = streamFromString(`data: one\r\n\r\ndata: two\r\n\r\n`);
    expect(await collect(parseSseStream(stream))).toEqual(["one", "two"]);
  });

  test("concatenates multi-line data within one event", async () => {
    const stream = streamFromString(`data: line1\ndata: line2\n\n`);
    expect(await collect(parseSseStream(stream))).toEqual(["line1\nline2"]);
  });

  test("survives chunk splits mid-event", async () => {
    const stream = chunkedStream(["data: par", "tial pay", "load\n\n"]);
    expect(await collect(parseSseStream(stream))).toEqual(["partial payload"]);
  });

  test("flushes trailing event on EOF without blank line", async () => {
    const stream = streamFromString(`data: trailing`);
    expect(await collect(parseSseStream(stream))).toEqual(["trailing"]);
  });

  test("strips single leading space from data line", async () => {
    const stream = streamFromString(`data:no-space\n\ndata: with-space\n\n`);
    expect(await collect(parseSseStream(stream))).toEqual(["no-space", "with-space"]);
  });

  test("ignores non-data event fields", async () => {
    const stream = streamFromString(`event: notice\ndata: payload\n\nid: 42\n\n`);
    // event: notice is paired with its data line; the id-only event has no data.
    expect(await collect(parseSseStream(stream))).toEqual(["payload"]);
  });
});
