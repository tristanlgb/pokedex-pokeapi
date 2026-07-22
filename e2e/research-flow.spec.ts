import { expect, test } from '@playwright/test';

const output = {
  id: 25, name: 'pikachu', image: 'https://example.com/pikachu.png', types: ['electric'],
  heightMeters: 0.4, weightKg: 6, baseExperience: 112, totalStats: 320,
  strongestStat: { name: 'speed', value: 90 },
  stats: [{ name: 'hp', value: 35 }, { name: 'speed', value: 90 }],
};

test('researches a Pokémon and renders the tool result', async ({ page }) => {
  await page.route('**/api/chat', async (route) => {
    const chunks = [
      { type: 'start', messageId: 'assistant-1' },
      { type: 'tool-input-start', toolCallId: 'tool-1', toolName: 'getPokemonInsight' },
      { type: 'tool-input-available', toolCallId: 'tool-1', toolName: 'getPokemonInsight', input: { name: 'pikachu' } },
      { type: 'tool-output-available', toolCallId: 'tool-1', output },
      { type: 'finish' },
    ];
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      headers: { 'x-vercel-ai-ui-message-stream': 'v1' },
      body: chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join('') + 'data: [DONE]\n\n',
    });
  });

  await page.goto('/');
  await page.getByRole('textbox', { name: /Pokémon to research/i }).fill('pikachu');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByRole('heading', { name: 'pikachu', exact: true })).toBeVisible();
  await expect(page.getByLabel('Base stats chart')).toContainText('Speed');
});
