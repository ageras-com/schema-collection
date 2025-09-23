# schema-collection

Home of public scheme for ageras-com organization

## Repository conventions

1. The repository expects [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) so release versioning is a automated process.

## Automated Releases with release-please

Releases are generated based on Conventional Commits. When a PR is merged into `main`, `release-please` creates a PR with release notes and version.

Commits not following Conventional Commits will be ignored. To force a version, push an empty commit:

```bash
git commit --allow-empty -m "chore: release 6.1.1" -m "Release-As: v6.1.1"
```

## Table of Contents

### json scheme

#### NestJS golden path

- [config](json-schema/nestjs-goldenpath/config/README.md) - Configuration schema for NestJS golden path
