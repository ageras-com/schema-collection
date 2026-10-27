# Golden path config

Validates configuration files following this pattern:

```yaml

name: service-name
description: Your service description
type: one of [ecs, lambda, cloudrun]

registry:
  type: one of [ecr, gar]
  repository: your-repository
  region: your-region

deploy_sequentially: true # optional: one environment at a time, in listed order

<application-config>:
  <default (required) | staging | production>:
    <workload-config>:
      # Some attributes depending on the workload type
```
