#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const [, , schemasDir] = process.argv;
if (!schemasDir) {
  console.error('Usage: sync-catalog-context.mjs <schemas-dir>');
  process.exit(1);
}

const catalogRoot = path.join(__dirname, '..', 'json-schema', 'datadog-catalog', 'v3');

function readSource(name) {
  const file = path.join(schemasDir, name);
  if (!fs.existsSync(file)) throw new Error(`Source file not found: ${file}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readTarget(relPath) {
  return JSON.parse(fs.readFileSync(path.join(catalogRoot, relPath), 'utf8'));
}

function writeTarget(relPath, obj) {
  fs.writeFileSync(path.join(catalogRoot, relPath), JSON.stringify(obj, null, 2) + '\n');
  console.log(`  updated ${relPath}`);
}

function main() {
  const tierSrc = readSource('tier.schema.json');
  const lifecycleSrc = readSource('lifecycle.schema.json');
  const domainSrc = readSource('domain.schema.json');
  const serviceTypeSrc = readSource('service-type.schema.json');

  const domainEnum = domainSrc.properties.domain.enum;
  const domainAreas = {};
  for (const block of domainSrc.allOf) {
    const d = block.if?.properties?.domain?.const;
    const areas = block.then?.properties?.area?.enum;
    if (d && areas) domainAreas[d] = areas;
  }
  const allAreas = domainEnum.flatMap(d => domainAreas[d] ?? []);

  {
    const schema = readTarget('partials/spec-defaults.schema.json');
    schema.properties.lifecycle.enum = lifecycleSrc.enum;
    schema.properties.tier.enum = tierSrc.enum;
    writeTarget('partials/spec-defaults.schema.json', schema);
  }

  {
    const schema = readTarget('partials/extensions-defaults.schema.json');
    schema.properties.domain.enum = domainEnum;
    schema.properties.area.enum = allAreas;
    schema.allOf = domainEnum.map(d => ({
      if: { required: ['domain'], properties: { domain: { const: d } } },
      then: { properties: { area: { enum: domainAreas[d] ?? [] } } },
    }));
    writeTarget('partials/extensions-defaults.schema.json', schema);
  }

  {
    const schema = readTarget('partials/tags-defaults.schema.json');
    schema.allOf = [
      ...domainEnum.map(d => ({
        if: {
          required: ['extensions'],
          properties: { extensions: { required: ['domain'], properties: { domain: { const: d } } } },
        },
        then: {
          required: ['metadata'],
          properties: {
            metadata: {
              required: ['tags'],
              properties: { tags: { contains: { const: `domain:${d}` } } },
            },
          },
        },
      })),
      ...allAreas.map(a => ({
        if: {
          required: ['extensions'],
          properties: { extensions: { required: ['area'], properties: { area: { const: a } } } },
        },
        then: {
          required: ['metadata'],
          properties: {
            metadata: {
              required: ['tags'],
              properties: { tags: { contains: { const: `area:${a}` } } },
            },
          },
        },
      })),
    ];
    writeTarget('partials/tags-defaults.schema.json', schema);
  }

  {
    const schema = readTarget('service.schema.json');
    const specAllOf = schema.allOf?.[1]?.properties?.spec?.allOf;
    if (!specAllOf)
      throw new Error(
        'Unexpected service.schema.json structure: missing allOf[1].properties.spec.allOf',
      );
    const typeBlock = specAllOf.find(b => b.properties?.type !== undefined);
    if (!typeBlock) throw new Error('Cannot locate type.enum in service.schema.json spec.allOf');
    typeBlock.properties.type.enum = serviceTypeSrc.enum;
    writeTarget('service.schema.json', schema);
  }

  console.log('Sync complete.');
}

try {
  main();
} catch (err) {
  console.error(err.message ?? err);
  process.exit(1);
}
