# Datadog Service Catalog v3 — Ageras schema

Validates `catalog-info.yaml` files for Datadog Service Catalog v3 entries, narrowing the upstream schema to Ageras-approved values.

## Schema files

Pick the schema matching the entity's `kind`. Each extends the upstream Datadog schema for that kind via `allOf` and adds org-specific enum constraints.

| File | `kind` | Purpose |
|---|---|---|
| `service.schema.json` | `service` | Narrows service-specific fields (`type`, `languages`) plus the shared conventions below. |
| `system.schema.json` | `system` | Narrows the shared conventions (lifecycle, tier, contact/link types). |
| `datastore.schema.json` | `datastore` | Narrows the shared conventions. Lifecycle/tier usually arrive via `inheritFrom`, so the enums only bite when set explicitly. |
| `queue.schema.json` | `queue` | Narrows the shared conventions. Same `inheritFrom` note as datastore. |
| `vendor/` | — | Local copies of all Datadog sub-schemas (including `system`/`datastore`/`queue`), mirrored from upstream for offline use or auditing. |

A `service.datadog.yaml` holds a single `service` entity. A root `entity.datadog.yaml` may hold multiple documents (one `system`, plus its `datastore`/`queue` peers) — validate each document against the schema for its `kind`.

## Narrowed enums

The following fields are constrained from free strings to organisation-approved values.

**Shared across all kinds:**

| Field | Allowed values |
|---|---|
| `spec.lifecycle` | `experimental`, `production`, `deprecated` (maturity, **not** deployment environment) |
| `spec.tier` | `1`, `2`, `3`, `4` (house criticality tier, 1 = highest) |
| `metadata.contacts[].type` | `email`, `slack`, `microsoft-teams`, `pagerduty` |
| `metadata.links[].type` | `runbook`, `doc`, `repo`, `dashboard`, `other` |

**`service` only:**

| Field | Allowed values |
|---|---|
| `spec.type` | `web`, `grpc`, `worker`, `scheduled-job`, `function`, `library` |
| `spec.languages[]` | `dotnet`, `go`, `java`, `js`, `typescript`, `php`, `python`, `ruby` |

The open `spec.type` of `system`/`datastore`/`queue` (e.g. `internal`, `postgres`, `redis`, `sqs`) is left to upstream validation — it is not constrained here.

To add or remove values, edit the `enum` arrays in the relevant schema file.

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

The upstream schema handles all structural validation (required fields, types, formats). The second member narrows specific fields. Both must pass — so values must satisfy the upstream constraints _and_ be in the Ageras-approved enum.

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
      contact: https://ageras.slack.com/archives/C0123PAYMENTS
  links:
    - name: Runbook
      type: runbook
      url: https://wiki.ageras.com/payments-api
spec:
  lifecycle: production
  tier: '1'
  type: web
  languages:
    - go
```
