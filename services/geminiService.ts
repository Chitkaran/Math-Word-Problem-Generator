import type { FormState } from '../types';

export async function* generateWordProblemsStream(settings: FormState): AsyncGenerator<{ text: string }> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let msg = errorData.error;
    if (!msg) {
      if (response.status === 503) {
        msg = 'The AI model is experiencing a temporary spike in high demand. Please try again in a few moments.';
      } else {
        msg = `Failed to generate word problems (Status: ${response.status})`;
      }
    }
    throw new Error(msg);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response stream is not readable.');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const dataStr = trimmed.slice(6);
      if (dataStr === '[DONE]') return;

      try {
        const parsed = JSON.parse(dataStr);
        if (parsed.error) {
          throw new Error(parsed.error);
        }
        if (parsed.text) {
          yield { text: parsed.text };
        }
      } catch (err: any) {
        if (err.message && !err.message.includes('JSON')) {
          throw err;
        }
      }
    }
  }
}
