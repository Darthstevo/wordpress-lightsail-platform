# Scripts (Guidance)

This folder will host helper scripts you build in Python. Use these as learning exercises and as automation helpers.

## Suggested scripts

### 1) `validate_site_artifacts.py`

Purpose: Validate that a site's artifact package includes expected WordPress paths.

Checklist:

- Accept path to an artifact tarball (for example `site-artifacts.tar.gz`)
- List entries and verify `wp-content/plugins` and `wp-content/themes`
- Report counts of files and top-level folders
- Exit non-zero if required folders missing

### 2) `inventory_plugins.py`

Purpose: Produce a CSV/JSON inventory of plugins/themes from `wp-content`.

Checklist:

- Accept path to extracted `wp-content`
- Enumerate `wp-content/plugins/*` and `wp-content/themes/*`
- Capture plugin/theme folder name and presence of `readme.txt`
- Output JSON or CSV summary

### 3) `validate_platform_config.py`

Purpose: Validate site/environment config before deployment.

Checklist:

- Accept path to a YAML/ENV config file
- Verify required keys (domain, admin email, environment)
- Validate domain/URL format and fail on invalid values
- Print a clear error summary and exit non-zero on failures
