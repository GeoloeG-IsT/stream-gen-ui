import { describe, expect, it } from 'vitest';

import { POST } from './route';

describe('/api/chat route', () => {
  // Helper for v5 format (content string)
  const createRequest = (
    messages: { role: string; content: string }[],
    format?: string
  ): Request => {
    const url = format
      ? `http://localhost:3000/api/chat?format=${format}`
      : 'http://localhost:3000/api/chat';

    return new Request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
  };

  // Helper for v6 format (parts array)
  const createV6Request = (
    messages: { role: string; parts: Array<{ type: string; text: string }> }[],
    format?: string
  ): Request => {
    const url = format
      ? `http://localhost:3000/api/chat?format=${format}`
      : 'http://localhost:3000/api/chat';

    return new Request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
  };

  const createRawRequest = (body: string, format?: string): Request => {
    const url = format
      ? `http://localhost:3000/api/chat?format=${format}`
      : 'http://localhost:3000/api/chat';

    return new Request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  };

  describe('AI SDK v6 format (parts)', () => {
    it('accepts messages with parts array instead of content', { timeout: 30000 }, async () => {
      const req = createV6Request([
        { role: 'user', parts: [{ type: 'text', text: 'hello' }] },
      ]);
      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('returns streaming response for v6 format', { timeout: 30000 }, async () => {
      const req = createV6Request([
        { role: 'user', parts: [{ type: 'text', text: 'hello' }] },
      ]);
      const response = await POST(req);
      const text = await response.text();
      expect(text).toContain('contactcard');
    });
  });

  describe('error handling', () => {
    it('returns 400 for invalid JSON body', async () => {
      const req = createRawRequest('not valid json');
      const response = await POST(req);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid JSON body');
    });

    it('returns 400 when messages field is missing', async () => {
      const req = createRawRequest(JSON.stringify({}));
      const response = await POST(req);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('messages array required');
    });

    it('returns 400 when messages is not an array', async () => {
      const req = createRawRequest(JSON.stringify({ messages: 'not an array' }));
      const response = await POST(req);
      expect(response.status).toBe(400);
    });

    it('returns 400 when messages array is empty', async () => {
      const req = createRawRequest(JSON.stringify({ messages: [] }));
      const response = await POST(req);
      expect(response.status).toBe(400);
    });

    it('accepts any role string for AI SDK compatibility', async () => {
      // AI SDK may use various roles like 'tool', so we accept any string
      const req = createRawRequest(
        JSON.stringify({ messages: [{ role: 'tool', content: 'hello' }] })
      );
      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('returns 400 when message is missing content', async () => {
      const req = createRawRequest(
        JSON.stringify({ messages: [{ role: 'user' }] })
      );
      const response = await POST(req);
      expect(response.status).toBe(400);
    });

    it('defaults to flowtoken for invalid format parameter', { timeout: 30000 }, async () => {
      const req = createRequest(
        [{ role: 'user', content: 'hello' }],
        'invalid-format'
      );
      const response = await POST(req);
      expect(response.status).toBe(200);
      const text = await response.text();
      // Should use flowtoken format (XML tags)
      expect(text).toContain('contactcard');
    });
  });

  describe('POST handler', () => {
    it('returns a Response object', async () => {
      const req = createRequest([{ role: 'user', content: 'hello' }]);
      const response = await POST(req);
      expect(response).toBeInstanceOf(Response);
    });

    it('returns 200 status', async () => {
      const req = createRequest([{ role: 'user', content: 'hello' }]);
      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it('sets Content-Type header for event stream', async () => {
      const req = createRequest([{ role: 'user', content: 'hello' }]);
      const response = await POST(req);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });

    it('returns a readable stream', async () => {
      const req = createRequest([{ role: 'user', content: 'hello' }]);
      const response = await POST(req);
      expect(response.body).toBeInstanceOf(ReadableStream);
    });
  });

  describe('format parameter', () => {
    it('defaults to flowtoken when no format specified', { timeout: 30000 }, async () => {
      const req = createRequest([{ role: 'user', content: 'hello' }]);
      const response = await POST(req);
      const text = await response.text();
      // FlowToken uses XML tags (lowercase for HTML5 custom elements)
      expect(text).toContain('contactcard');
    });

    it('returns flowtoken content when format=flowtoken', { timeout: 30000 }, async () => {
      const req = createRequest(
        [{ role: 'user', content: 'hello' }],
        'flowtoken'
      );
      const response = await POST(req);
      const text = await response.text();
      expect(text).toContain('contactcard');
    });

    it('returns llm-ui content when format=llm-ui', { timeout: 30000 }, async () => {
      const req = createRequest(
        [{ role: 'user', content: 'hello' }],
        'llm-ui'
      );
      const response = await POST(req);
      const text = await response.text();
      expect(text).toContain('CONTACT');
    });

    it('returns streamdown content when format=streamdown', { timeout: 30000 }, async () => {
      const req = createRequest(
        [{ role: 'user', content: 'hello' }],
        'streamdown'
      );
      const response = await POST(req);
      const text = await response.text();
      expect(text).toContain('contactcard');
    });
  });

  describe('UIMessageStream format', () => {
    it('uses text-start event to begin streaming', { timeout: 30000 }, async () => {
      const req = createRequest([{ role: 'user', content: 'hello' }]);
      const response = await POST(req);
      const text = await response.text();
      // Should have text-start event
      expect(text).toContain('"type":"text-start"');
    });

    it('includes text-delta events for content', { timeout: 30000 }, async () => {
      const req = createRequest([{ role: 'user', content: 'hello' }]);
      const response = await POST(req);
      const text = await response.text();
      expect(text).toContain('"type":"text-delta"');
      expect(text).toContain('"delta"');
    });

    it('includes text-end and done events', { timeout: 30000 }, async () => {
      const req = createRequest([{ role: 'user', content: 'hello' }]);
      const response = await POST(req);
      const text = await response.text();
      expect(text).toContain('"type":"text-end"');
      expect(text).toContain('[DONE]');
    });
  });
});
