import { expect, test } from '@playwright/test';
import { mockCatalog } from './catalog-fixtures';
test.beforeEach(async ({ page }) => {
  await mockCatalog(page);
});

test('search from page two, clear search, and filter beyond 36 results', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(
    page.getByRole('button', { name: 'Ver detalles de pokemon-21', exact: true }),
  ).toBeVisible();
  await page.getByRole('textbox', { name: 'Buscar Pokémon' }).fill('#025');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Ver detalles de pikachu' })).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Lista de Pokémon' }).locator('article'),
  ).toHaveCount(1);
  await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();
  await expect(page.getByRole('button', { name: 'Ver detalles de bulbasaur' })).toBeVisible();
  await page.getByRole('button', { name: 'Planta', exact: true }).click();
  await expect(page.getByText('40 Pokémon', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(
    page.getByRole('button', { name: 'Ver detalles de pokemon-40', exact: true }),
  ).toBeVisible();
});

test('generation and global stat order combine and survive reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Generación', exact: true }).selectOption('1');
  await page.getByRole('combobox', { name: 'Ordenar por', exact: true }).selectOption('speed');
  const cards = page.getByRole('region', { name: 'Lista de Pokémon' }).locator('article');
  await expect(cards.first().getByRole('heading')).toHaveText('pokemon-30');
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Generación', exact: true })).toHaveValue('1');
  await expect(cards.first().getByRole('heading')).toHaveText('pokemon-30');
});

test('favorites persist and an empty collection has a useful action', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Agregar a favoritos a bulbasaur', exact: true }).click();
  await page.getByRole('button', { name: 'Favoritos 1', exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole('region', { name: 'Lista de Pokémon' }).locator('article'),
  ).toHaveCount(1);
  await page.getByRole('button', { name: 'Quitar de favoritos a bulbasaur' }).click();
  await expect(page.getByText('Todavía no guardaste favoritos')).toBeVisible();
  await page.getByRole('button', { name: 'Explorar todos' }).click();
  await expect(page.getByRole('button', { name: 'Ver detalles de bulbasaur' })).toBeVisible();
});

test('modal supports keyboard focus, shiny, evolutions, and deep links', async ({ page }) => {
  await page.goto('/?type=grass');
  const trigger = page.getByRole('button', { name: 'Ver detalles de bulbasaur' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'bulbasaur', exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Cerrar ficha' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest('dialog')))).toBe(true);
  await dialog.getByRole('button', { name: 'Ver shiny' }).click();
  await expect(dialog.getByRole('img', { name: 'bulbasaur shiny' })).toBeVisible();
  await dialog.getByRole('button', { name: 'ivysaur', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'ivysaur', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/pokemon=2/);
  await page.reload();
  await expect(dialog.getByRole('heading', { name: 'ivysaur', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Planta', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await trigger.click();
  await expect(dialog.getByRole('heading', { name: 'bulbasaur', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('comparison and team persist with enforced selection limits', async ({ page }) => {
  await page.goto('/');
  for (const name of ['bulbasaur', 'ivysaur'])
    await page.getByRole('button', { name: 'Comparar a ' + name, exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Comparar a venusaur', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Comparar 2/2' }).click();
  await expect(page.getByRole('table')).toContainText('Diferencia');
  await expect(page.getByRole('table')).toContainText('+1');
  await page.getByRole('button', { name: 'Explorar', exact: true }).click();
  for (const name of ['bulbasaur', 'ivysaur', 'venusaur', 'charmander', 'charmeleon', 'charizard'])
    await page.getByRole('button', { name: 'Agregar al equipo a ' + name, exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Agregar al equipo a squirtle', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Mi equipo 6/6' }).click();
  await expect(page.getByRole('heading', { name: 'Balance defensivo' })).toBeVisible();
  await expect(page.getByText('6 débiles', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Mi equipo 6/6' })).toBeVisible();
  await page.getByRole('button', { name: 'Quitar a bulbasaur', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mi equipo 5/6' })).toBeVisible();
});

test('mobile keeps two cards per row without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const cards = page.getByRole('region', { name: 'Lista de Pokémon' }).locator('article');
  await expect(cards).toHaveCount(20);
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  expect(first?.y).toBe(second?.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: 'test-results/catalog-mobile.png', fullPage: true });
});

test('a failed catalog request can be retried', async ({ page }) => {
  let fail = true;
  await page.route('**/pokemon-species?limit=*', async (route) => {
    if (fail) {
      await route.fulfill({ status: 503, json: {} });
    } else await route.fallback();
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('No pudimos cargar el catálogo');
  fail = false;
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Ver detalles de bulbasaur' })).toBeVisible();
});
