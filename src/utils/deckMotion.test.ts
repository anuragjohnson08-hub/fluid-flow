import test from "node:test";
import assert from "node:assert/strict";
import {
  aboveCount,
  arrived,
  clamp01,
  computeCardTransforms,
  formatDeckHost,
} from "./deckMotion";
import { REVIEW_DECK_CARDS } from "../data/reviewDeck";

test("clamp01 clamps out-of-range values", () => {
  assert.equal(clamp01(-0.5), 0);
  assert.equal(clamp01(0.42), 0.42);
  assert.equal(clamp01(2.1), 1);
});

test("formatDeckHost strips protocol and trailing slash", () => {
  assert.equal(formatDeckHost("https://opencritic.com/"), "opencritic.com");
  assert.equal(formatDeckHost("http://store.steampowered.com/app/1091500/"), "store.steampowered.com/app/1091500");
});

test("arrived stays 1 for card 0 and transitions 0 -> 1 for subsequent cards", () => {
  assert.equal(arrived(0, 0, 6), 1);
  assert.equal(arrived(0, 0.5, 6), 1);
  assert.equal(arrived(0, 1, 6), 1);

  assert.equal(arrived(1, 0, 6), 0);
  assert.equal(arrived(5, 0, 6), 0);
  assert.equal(arrived(5, 1, 6), 1);
});

test("aboveCount caps stacked depth at 3", () => {
  assert.equal(aboveCount(0, 1, 6), 3);
  assert.equal(aboveCount(4, 1, 6), 1);
  assert.equal(aboveCount(5, 1, 6), 0);
});

test("computeCardTransforms gives flat sharp landed state when resting on top and hides deeply buried cards", () => {
  const topAtEnd = computeCardTransforms(5, 1, 6);
  assert.equal(topAtEnd.ySvh, 0);
  assert.equal(topAtEnd.rotateXDeg, 0);
  assert.equal(topAtEnd.scale, 1);
  assert.equal(topAtEnd.blurPx, 0);
  assert.equal(topAtEnd.dimOpacity, 0);
  assert.equal(topAtEnd.stillYSvh, 0);
  assert.equal(topAtEnd.visible, true);

  const buriedAtEnd = computeCardTransforms(0, 1, 6);
  assert.equal(buriedAtEnd.visible, false);
});

test("REVIEW_DECK_CARDS includes both Fluid Flow game reviews and partner review websites", () => {
  const gameReviews = REVIEW_DECK_CARDS.filter((c) => c.kind === "game-review");
  const partnerHubs = REVIEW_DECK_CARDS.filter((c) => c.kind === "partner-hub");
  assert.ok(gameReviews.length >= 3, "Expected at least 3 game review cards");
  assert.ok(partnerHubs.length >= 3, "Expected at least 3 partner review hub cards");

  for (const card of REVIEW_DECK_CARDS) {
    assert.ok(card.name.length > 0);
    assert.ok(card.url.startsWith("https://"));
    assert.ok(card.summary.length > 10);
    assert.ok(card.partnerStats.length === 3);
  }
});
