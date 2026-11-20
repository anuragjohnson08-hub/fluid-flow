import test from 'node:test';
import assert from 'node:assert/strict';
import { getReviewApiById, REVIEW_API_PROVIDERS } from '../src/data/reviewApis';

test('REVIEW_API_PROVIDERS lists all six verified game review API websites with valid docs URLs', () => {
  assert.equal(REVIEW_API_PROVIDERS.length, 6);
  const ids = new Set(REVIEW_API_PROVIDERS.map((p) => p.id));
  assert.equal(ids.size, 6);

  for (const provider of REVIEW_API_PROVIDERS) {
    assert.ok(provider.name.length > 0);
    assert.ok(provider.endpoint.length > 0);
    assert.ok(provider.reviewFields.length > 0);
    assert.ok(provider.docsUrl.startsWith('https://'), `Invalid URL: ${provider.docsUrl}`);
    assert.ok(provider.siteUrl.startsWith('https://'), `Invalid Site URL: ${provider.siteUrl}`);
  }
});

test('getReviewApiById returns matching provider and falls back to first provider', () => {
  assert.equal(getReviewApiById('steam').name, 'Steam');
  assert.equal(getReviewApiById('igdb').name, 'IGDB');
  assert.equal(getReviewApiById('unknown-id').id, REVIEW_API_PROVIDERS[0].id);
});
