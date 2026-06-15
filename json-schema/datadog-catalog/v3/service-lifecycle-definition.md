The lifecycle state reflects the maturity and operational readiness of a service — not its deployment environment. Every service should have a lifecycle assigned so teams and tooling can make appropriate assumptions about reliability, support, and change velocity.

| Lifecycle State  | Meaning                                                                                     | Uptime Expectations                                                                     | Change Velocity                                           | Ownership                                                   |
| ---------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| **experimental** | Under active development or proof-of-concept; not relied upon by other systems or customers | No guarantees; may be unavailable without notice                                        | High; breaking changes expected                           | Owner team; no on-call obligation                           |
| **production**   | Actively serving business or customer traffic; subject to service tier commitments          | Per assigned service tier (see [Service Tier Definition](./service-tier-definition.md)) | Managed; changes go through review and deployment process | Owner team with on-call responsibility per tier             |
| **deprecated**   | Scheduled for decommission; no new consumers should integrate with it                       | Best-effort; tier commitments no longer apply                                           | Frozen; only critical fixes accepted                      | Owner team responsible for migration path and shutdown plan |

### experimental

The service is being built or validated. It may be deployed to production infrastructure (Lambda, Cloud Run, ECS, GKE, etc.) but it carries no reliability or stability commitments. Other services should not take a runtime dependency on it. If a service has been experimental for more than 90 days without a clear plan to promote it, it should be reviewed for promotion or removal.

### production

The service is live and has agreed operational standards enforced by its assigned tier. It must have a named owner, a defined on-call rotation (for Tier 1 and 2), monitoring configured in Datadog, and a runbook. Promoting a service from `experimental` to `production` is a deliberate act that signals readiness to the wider organisation.

### deprecated

The service is being retired. It should still be monitored but receives no feature work. A deprecation should include a target shutdown date and a migration guide for any consumers. Once all traffic is migrated and infrastructure is torn down, the catalog entry should be removed entirely rather than left in a deprecated state indefinitely.
