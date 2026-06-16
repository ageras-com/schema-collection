The service type describes the runtime pattern of a service — how it receives work and how it runs. Choosing the right type helps Datadog surface accurate topology, and helps teams reason about scaling, observability, and ownership boundaries.

| Service Type      | Description                                                                                    | Typical AWS primitives                                                                      | Typical GCP primitives                                     |
| ----------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **web**           | Serves synchronous HTTP/HTTPS traffic; exposes a public or internal API                        | ECS service behind an Application Load Balancer; API Gateway + Lambda (if request-response) | Cloud Run service; GKE Deployment behind a load balancer   |
| **grpc**          | Serves synchronous gRPC traffic; typically internal service-to-service                         | ECS service; ALB with gRPC routing                                                          | Cloud Run service (gRPC); GKE Deployment                   |
| **worker**        | Consumes work from a queue or stream; long-running, no inbound HTTP                            | ECS task consuming from SQS or Kinesis; Fargate service                                     | Cloud Run worker consuming from Pub/Sub; GKE Deployment    |
| **scheduled-job** | Executes on a time-based schedule; short-lived and exits on completion                         | Lambda triggered by EventBridge Scheduler; ECS Scheduled Task                               | Cloud Run job triggered by Cloud Scheduler; GKE CronJob    |
| **function**      | Short-lived, event-driven compute; invoked by an event source rather than a persistent process | Lambda (triggered by S3, SQS, SNS, EventBridge, etc.)                                       | Cloud Functions; Cloud Run function                        |
| **library**       | Shared code distributed as a package; no runtime process of its own                            | n/a — published to a package registry (npm, PyPI, Packagist, etc.)                          | n/a — published to a package registry or Artifact Registry |

### Choosing between worker, scheduled-job, and function

These three types are easy to conflate:

- Use **worker** when the service runs continuously and pulls work as it arrives (queue consumer, stream processor).
- Use **scheduled-job** when the service wakes up on a fixed schedule, does a bounded unit of work, and exits (nightly report, data sync).
- Use **function** when the service is invoked by an event and has no persistent infrastructure — it scales to zero and is billed per invocation.

### web vs grpc

Both serve synchronous request-response traffic. Use **web** for HTTP/REST or GraphQL APIs. Use **grpc** when the transport is gRPC — this matters for load balancer configuration, health check probes, and observability instrumentation.

### library

A library has no running instances and no deployment pipeline in the traditional sense. It should still be catalogued to track ownership, language, and links to its package registry entry and changelog. Tier and lifecycle apply in the same way as for any other service.
