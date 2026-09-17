import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const root = css.match(/:root\s*\{([^}]+)\}/)[1];

test('homepage uses the requested Prussian blue for its accent and browser theme', () => {
  assert.match(root, /--accent:\s*#003153\s*;/i);
  assert.match(root, /--accent-rgb:\s*0,\s*49,\s*83\s*;/);
  assert.match(html, /<meta name="theme-color" content="#003153">/i);
});

test('homepage does not retain the previous royal-blue accents', () => {
  assert.doesNotMatch(html, /#(?:003087|00226b|0a57d6|2d61a6)\b|rgba?\(\s*0,\s*(?:48,\s*135|76,\s*204)\s*[,)]/i);
});

test('back-to-top button follows the shared homepage palette', () => {
  assert.match(css, /#back-to-top\s*\{[^}]*background-color:\s*var\(--accent\)/);
  assert.match(css, /#back-to-top:hover\s*\{[^}]*background-color:\s*var\(--accent-dark\)/);
});

test('muted hero text remains readable on the pale blue gradient', () => {
  const luminance = (hex) => hex.slice(1).match(/../g).map((channel) => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
  const surface = css.match(/radial-gradient\(ellipse at 0 10%, (#[\da-f]{6})/i)[1];
  for (const name of ['profile-title', 'profile-contact']) {
    const rule = css.match(new RegExp(`\\.${name}\\s*\\{([^}]+)\\}`))[1];
    const color = rule.match(/(?:^|;)\s*color:\s*(#[\da-f]{6})/i)[1];
    const contrast = (luminance(surface) + 0.05) / (luminance(color) + 0.05);
    assert.ok(contrast >= 4.5, `${name} contrast is ${contrast.toFixed(2)}:1; expected at least 4.5:1`);
  }
});
