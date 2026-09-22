import type { FormState } from '../types';

export async function* generateWordProblemsStream(settings: FormState): AsyncGenerator<{ text: string }, void, unknown> {
  const selectedLevels = Object.entries(settings.differentiation)
    .filter(([, value]) => value)
    .map(([key]) => key);

  if (selectedLevels.length === 0) {
    throw new Error("Please select at least one differentiation level.");
  }

  const response = await fetch('/api/generate-problems', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    let errorMsg = "Failed to generate word problems. Please try again.";
    try {
      const errData = await response.json();
      if (errData?.error) {
        errorMsg = errData.error;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Unable to read streaming response from server.");
  }

  const decoder = new TextDecoder("utf-8");
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      if (text) {
        yield { text };
      }
    }
  } finally {
    reader.releaseLock();
  }
}
