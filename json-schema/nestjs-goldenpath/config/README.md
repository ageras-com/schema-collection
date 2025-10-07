# Golden path config

Validates configuration files following this pattern:

```yaml

name: service-name
description: Your service description
type: one of [ecs]

registry:
  type: one of [ecr]
  repository: your-repository
  region: your-region

<application-config>:
  <default (required) | staging | production>:
    <workload-config>:
      # Some attributes depending on the workload type
```
