/**
 * @namespace typedefs
 */

/**
 * Shine Event Envelope
 * 
 * Envelope schema for Shine events. The envelope provides standardized event metadata 
 * in the 'event' property, while the actual message content is contained in 'metadata' 
 * and 'data' properties.
 * 
 * @typedef {Object} ShineEventEnvelope
 * @property {EventMetadata} event - Event metadata
 * @property {Object} metadata - Additional metadata
 * @property {Object} data - Event payload data
 */

/**
 * Event metadata
 * 
 * @typedef {Object} EventMetadata
 * @property {string} source - Source system identifier
 * @property {string} type - Event type identifier
 * @property {string} sourceMessageId - Original message ID from source
 * @property {string} [time] - Event timestamp in RFC 3339 format (ISO 8601 date-time)
 * @property {string} [partitionKey] - Optional partition key for ordering
 * @property {string} [correlationId] - Optional correlation ID for tracing
 * @property {string} [subject] - Identifies the subject of the event in the context of the event producer (e.g., 'account/a1b2c3d4', 'transaction/xyz123')
 * @property {string} [schema] - URI identifying the schema that data adheres to
 * @property {string} [specversion] - Version of the Shine Event Envelope specification (format: x.y.z)
 */