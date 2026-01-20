import { describe, expect, it } from 'vitest';

import { POST } from './route';

describe('/api/chat route', () => {
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

    it('returns 400 when message has invalid role', async () => {
      const req = createRawRequest(
        JSON.stringify({ messages: [{ role: 'invalid', content: 'hello' }] })
      );
      const response = await POST(req);
      expect(response.status).toBe(400);
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
      expect(text).toContain('ContactCard');
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

    it('sets Content-Type header', async () => {
      const req = createRequest([{ role: 'user', content: 'hello' }]);
      const response = await POST(req);
      expect(response.headers.get('Content-Type')).toBe(
        'text/plain; charset=utf-8'
      );
    });

    it('sets X-Vercel-AI-Data-Stream header', async () => {
      const req = createRequest([{ role: 'user', content: 'hello' }]);
      const response = await POST(req);
      expect(response.headers.get('X-Vercel-AI-Data-Stream')).toBe('v1');
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
      // FlowToken uses XML tags
      expect(text).toContain('ContactCard');
    });

    it('returns flowtoken content when format=flowtoken', { timeout: 30000 }, async () => {
      const req = createRequest(
        [{ role: 'user', content: 'hello' }],
        'flowtoken'
      );
      const response = await POST(req);
      const text = await response.text();
      expect(text).toContain('ContactCard');
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
      expect(text).toContain('ContactCard');
    });
  });

  describe('stream protocol format', () => {
    it('uses AI SDK data stream format with 0: prefix', { timeout: 30000 }, async () => {
      const req = createRequest([{ role: 'user', content: 'hello' }]);
      const response = await POST(req);
      const text = await response.text();
      // Should have text chunks with 0: prefix
      expect(text).toMatch(/0:/);
    });

    it('includes finish event (e:)', { timeout: 30000 }, async () => {
      const req = createRequest([{ role: 'user', content: 'hello' }]);
      const response = await POST(req);
      const text = await response.text();
      expect(text).toContain('e:');
      expect(text).toContain('finishReason');
    });

    it('includes done event (d:)', { timeout: 30000 }, async () => {
      const req = createRequest([{ role: 'user', content: 'hello' }]);
      const response = await POST(req);
      const text = await response.text();
      expect(text).toContain('d:');
    });
  });
});
