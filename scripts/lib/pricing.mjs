const fields = ['id', 'media', 'name', 'provider', 'dimension', 'context', 'unit', 'sourceUrl', 'observedAt', 'note', 'points'];
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function assertPricing(input) {
  const fail = message => { throw new Error(`Configuration pricing validation failed: ${message}`); };
  if (!object(input) || Object.keys(input).join() !== 'families' || !Array.isArray(input.families) || !input.families.length) fail('expected a nonempty families array');
  const ids = new Set();
  for (const [index, family] of input.families.entries()) {
    const path = `families[${index}]`;
    if (!object(family) || Object.keys(family).length !== fields.length || fields.some(field => !Object.hasOwn(family, field))) fail(`${path}: unexpected fields`);
    for (const field of fields.filter(field => field !== 'points')) if (typeof family[field] !== 'string' || !family[field].trim()) fail(`${path}.${field}: expected nonempty text`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(family.id) || ids.has(family.id)) fail(`${path}.id: invalid or duplicate`);
    ids.add(family.id);
    if (!['image', 'video'].includes(family.media) || family.unit !== (family.media === 'image' ? 'image' : 'second')) fail(`${path}: incompatible media and unit`);
    if (!['quality', 'resolution', 'mode'].includes(family.dimension)) fail(`${path}.dimension: unknown`);
    try { if (new URL(family.sourceUrl).protocol !== 'https:') fail(`${path}.sourceUrl: expected HTTPS`); } catch { fail(`${path}.sourceUrl: invalid`); }
    if (!/^\d{4}-\d\d-\d\dT/.test(family.observedAt) || !Number.isFinite(Date.parse(family.observedAt))) fail(`${path}.observedAt: expected ISO timestamp`);
    if (!Array.isArray(family.points) || !family.points.length) fail(`${path}.points: empty`);
    const labels = new Set();
    for (const [pointIndex, point] of family.points.entries()) {
      if (!object(point) || Object.keys(point).length !== 2 || typeof point.label !== 'string' || !point.label.trim() || labels.has(point.label) || typeof point.price !== 'number' || !Number.isFinite(point.price) || point.price < 0) fail(`${path}.points[${pointIndex}]: invalid quote or duplicate label`);
      labels.add(point.label);
    }
  }
  return input;
}
