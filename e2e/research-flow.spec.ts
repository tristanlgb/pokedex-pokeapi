import { expect, test } from '@playwright/test';
import { mockCatalog } from './catalog-fixtures';
const output = {
  id: 25,
  name: 'pikachu',
  image: 'https://example.com/pikachu.png',
  types: ['electric'],
  heightMeters: 0.4,
  weightKg: 6,
  baseExperience: 112,
  totalStats: 320,
  strongestStat: { name: 'speed', value: 90 },
  stats: [
    { name: 'hp', value: 35 },
    { name: 'speed', value: 90 },
  ],
};
test.beforeEach(async ({ page }) => {
  await mockCatalog(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
});
test('researches a Pokémon through the stream transport', async ({ page }) => {
  await page.route('**/api/chat', async (route) => {
    const chunks = [
      { type: 'start', messageId: 'assistant-1' },
      { type: 'tool-input-start', toolCallId: 'tool-1', toolName: 'getPokemonInsight' },
      {
        type: 'tool-input-available',
        toolCallId: 'tool-1',
        toolName: 'getPokemonInsight',
        input: { name: 'pikachu' },
      },
      { type: 'tool-output-available', toolCallId: 'tool-1', output },
      { type: 'finish' },
    ];
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      headers: { 'x-vercel-ai-ui-message-stream': 'v1' },
      body:
        chunks.map((chunk) => 'data: ' + JSON.stringify(chunk) + '\n\n').join('') +
        'data: [DONE]\n\n',
    });
  });
  await page.goto('/?view=lab');
  await page.getByRole('textbox', { name: 'Pokémon para investigar' }).fill('pikachu');
  await page.getByRole('button', { name: 'Investigar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'pikachu', exact: true })).toBeVisible();
  await expect(page.getByLabel('Estadísticas base')).toContainText('Velocidad');
});
test('can start and stop a pending research request with the keyboard', async ({ page }) => {
  await page.route('**/api/chat', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      headers: { 'x-vercel-ai-ui-message-stream': 'v1' },
      body: 'data: {"type":"start","messageId":"assistant-keyboard"}\n\ndata: [DONE]\n\n',
    });
  });
  await page.goto('/?view=lab');
  await page.getByRole('textbox', { name: 'Pokémon para investigar' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Investigar', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Detener investigación' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Investigar', exact: true })).toBeVisible();
  await expect(
    page.getByText('Investigación detenida. Puedes iniciar otra consulta.'),
  ).toBeVisible();
});
