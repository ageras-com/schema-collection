# Datadog Service Catalog v3 — Shine schema

Validates `catalog-info.yaml` files for Datadog Service Catalog v3 entries, narrowing the upstream schema to Shine-approved values.

## Schema files

Pick the schema matching the entity's `kind`. Each extends the upstream Datadog schema for that kind via `allOf` and adds org-specific enum constraints.

| File                              | `kind`      | Purpose                                                                                                                               |
| --------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `service.schema.json`             | `service`   | Narrows service-specific fields (`type`, `languages`) plus the shared conventions below.                                              |
| `system.schema.json`              | `system`    | Narrows the shared conventions (lifecycle, tier, contact/link types).                                                                 |
| `datastore.schema.json`           | `datastore` | Narrows the shared conventions. Lifecycle/tier usually arrive via `inheritFrom`, so the enums only bite when set explicitly.          |
| `queue.schema.json`               | `queue`     | Narrows the shared conventions. Same `inheritFrom` note as datastore.                                                                 |
| `vendor/`                         | —           | Local copies of all Datadog sub-schemas (including `system`/`datastore`/`queue`), mirrored from upstream for offline use or auditing. |
| `service-tier-definition.md`      | —           | Describes the four service tiers and their SLO/SLA commitments.                                                                       |
| `service-lifecycle-definition.md` | —           | Describes the three lifecycle states and their operational expectations.                                                              |
| `service-type-definition.md`      | —           | Describes the six service types and guidance for choosing between them.                                                               |

A `service.datadog.yaml` holds a single `service` entity. A root `entity.datadog.yaml` may hold multiple documents (one `system`, plus its `datastore`/`queue` peers) — validate each document against the schema for its `kind`.

## Narrowed enums

The following fields are constrained from free strings to organisation-approved values.

**Shared across all kinds:**

| Field                      | Allowed values                                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `spec.lifecycle`           | `experimental`, `production`, `deprecated` (maturity, **not** deployment environment)                                        |
| `spec.tier`                | `1`, `2`, `3`, `none` (house criticality tier, 1 = highest — see [service-tier-definition.md](./service-tier-definition.md)) |
| `metadata.contacts[].type` | `email`, `slack`                                                                                                             |
| `metadata.links[].type`    | `runbook`, `doc`, `adr`, `repo`, `dashboard`, `other`                                                                        |

**`service` only:**

| Field            | Allowed values                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `spec.type`      | `web`, `grpc`, `worker`, `scheduled-job`, `function`, `library` — see [service-type-definition.md](./service-type-definition.md) |
| `spec.languages` | Free string; suggested values — Adopt: `typescript`, `python` \| Hold: `go`, `php`, `java`, `js`, `dart`                         |

**`datastore` only:**

| Field       | Allowed values                                                                    |
| ----------- | --------------------------------------------------------------------------------- |
| `spec.type` | `postgres`, `mysql`, `mongodb`, `spanner`, `redis`, `snowflake`, `s3`, `dynamodb` |

**`queue` only:**

| Field       | Allowed values                    |
| ----------- | --------------------------------- |
| `spec.type` | `sqs`, `sns`, `pubsub`, `kinesis` |

To add or remove values, edit the `enum` arrays in the relevant schema file. The `spec.type` enums for `datastore` and `queue` are defined in `datastore.schema.json` and `queue.schema.json` respectively.

## Extension pattern

`service.schema.json` uses `allOf` to compose constraints:

```json
{
  "allOf": [
    { "$ref": "https://raw.githubusercontent.com/DataDog/schema/main/service-catalog/v3/service.schema.json" },
    { "properties": { "spec": { "properties": { "lifecycle": { "enum": [...] } } } } }
  ]
}
```

The upstream schema handles all structural validation (required fields, types, formats). The second member narrows specific fields. Both must pass — so values must satisfy the upstream constraints _and_ be in the Shine-approved enum.

## Upstream schema URL

```
https://raw.githubusercontent.com/DataDog/schema/main/service-catalog/v3/service.schema.json
```

The vendor copies retain the original Datadog `$id` values and `$ref` URLs. Most JSON Schema validators that support a **schema mapping / URI remapping** feature can redirect those URLs to the local `vendor/` files — useful in CI or offline environments. Check your validator's documentation for the exact option (e.g. `--registry`, `--schema-map`).

## Example catalog entry

```yaml
apiVersion: v3
kind: service
metadata:
  name: payments-api
  description: Handles payment processing
  owner: payments-team
  contacts:
    - type: slack
      contact: https://shine.slack.com/archives/C0123PAYMENTS
  links:
    - name: Runbook
      type: runbook
      url: https://wiki.shine.com/payments-api
spec:
  lifecycle: production
  tier: '1'
  type: web
  languages: typescript
```
