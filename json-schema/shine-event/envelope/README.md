# Shine Event Envelope Specification

## Overview

This specification defines the standardized event envelope format for Shine's int(er|ra)-cloud event-driven architecture. The envelope provides a consistent, cloud-agnostic structure for events flowing between AWS and GCP platforms, enabling low-code integration without requiring transformation functions.

## Rationale

### Why Not Use Native Cloud Event Metadata?

While cloud platforms (AWS EventBridge, GCP Pub/Sub) provide their own event metadata, Shine uses an explicit envelope format for several key reasons:

1. **Inter-Cloud Compatibility**: Events must flow seamlessly between AWS and GCP without transformation
2. **Low-Code Implementation**: Eliminates the need for Functions/Lambda to normalize event structures
3. **Explicit Contract**: Provides a clear, enforceable schema that's independent of cloud provider implementation details
4. **Cost Efficiency**: Reduces compute costs by avoiding transformation steps

The envelope uses the `event` property for standardized routing and observability metadata, while `metadata` and `data` contain the actual message content.

## Envelope Structure

```jsonc
{
  "event": {
    "source": "service-name",
    "type": "EntityActionName",
    "sourceMessageId": "unique-id",
    // Optional fields
    "time": "2025-10-09T10:30:00Z",
    "subject": "<entity>/<id>",
    "correlationId": "trace-id",
    "partitionKey": "optional-key",
    "dataschema": "https://schemas.shine.com/v1/entity",
    "specversion": "1.0.0"
  },
  "metadata": {
    // Out of scope
  },
  "data": {
    // Out of scope
  }
}
```

## Event Property Specifications

### Required Fields

- **`source`** (string): Service identifier producing the event
  - Format: lowercase with hyphens, e.g., `bank-transaction-service`
- **`type`** (string): Event type identifier in PascalCase
  - Format: `<EntityName><Action>`, e.g., `BankAccountCreated`, `InvoiceApproved`
  - Past tense for events, present tense for commands
- **`sourceMessageId`** (string): Unique identifier for this specific event

### Optional Fields

- **`time`** (string): Event timestamp in RFC 3339 format
- **`correlationId`** (string): Trace ID for correlating events across services
- **`partitionKey`** (string): Key for maintaining event ordering within a partition
- **`subject`** (string): Identifies the subject of the event within the producer context
  - Examples: `account/a1b2c3d4`, `transaction/xyz123`
  - Useful for entity-specific routing and filtering
- **`dataschema`** (string, URI format): URI pointing to the schema definition for the event data
  - Example: `https://schemas.shine.com/v1/bank-account`
- **`specversion`** (string): Version of this Shine Event Envelope specification
  - Format: semantic versioning (e.g., `1.0.0`)
- **`_*`** (any): Additional non-essential properties prefixed with underscore (e.g., `_epoch` for AWS EventBridge direct integrations)

## Naming Conventions

### Property Names
- **camelCase** throughout `metadata` and `data`
- Root-level envelope properties use lowercase: `event`, `metadata`, `data`

## Metadata vs Data

- **`metadata`**: Contextual information for routing, filtering, tracing, and observability
  - Should not contain business logic data
  - May be used for technical routing decisions
  - Examples: `globalOrganizationId`, `invoiceSource`

- **`data`**: The actual event payload
  - Contains business entity state or command parameters
  - Should be kept minimal and flattened

## Governance

- **Schema Repository**: Centralized IaC repository for all event schemas
- **Change Management**: Changes managed via pull requests with CODEOWNERS approval
- **Validation**: Automatic validation against AWS Schema Registry
- **Ownership**: Schema owned by producing service; routing rules owned by consuming services

## Platform Considerations

### Message Size Limits

Different cloud platforms impose varying size limits on event messages. When designing events, consider:

- **GCP Pub/Sub**: 10 MB maximum message size
- **AWS EventBridge**: 256 KB maximum event size (including envelope)

**Best Practices**:
- Keep event payloads minimal and focused on essential data
- For large payloads, consider using reference patterns (store data in S3/GCS, pass reference in event)
- Design events with the smallest common denominator (256 KB) in mind for inter-cloud compatibility
- Use flattened structures to minimize JSON overhead

### Other Considerations

- **Ordering**: Use `partitionKey` when event ordering matters within a logical group
- **Idempotency**: Use `sourceMessageId` for deduplication and idempotent processing
- **Retries**: Events may be delivered multiple times; ensure consumers are idempotent
- **Schema Evolution**: Consider backward compatibility when updating schemas

## References

- Full JSON Schema: [`envelope.schema.json`](./envelope.schema.json)
