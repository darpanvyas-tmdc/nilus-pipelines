# Source and sink options

Use when the user asks for masking, type hints, incremental windows, partitioning, sampling, or any `source.options` / `sink.options` key.

Draft to the **DataOS `type: nilus` domain** (`.artifacts/nilus-domain.yaml`). Both option blocks are `additionalProperties: false`. Unknown keys quarantine apply.

Official product pages (nilus-book) sometimes show extra placements. If they conflict with this file, **this file wins for `type: nilus`**.

## Placement

| Knob | Block | Job |
|---|---|---|
| `source_table` | source | Which object to read |
| `incremental_key` | source | Cursor for new/changed rows |
| `primary_key` | source | Row identity for `merge` |
| `interval_start` / `interval_end` | source | Bounded extract window |
| `type_hints` | source | Override inferred column types |
| `mask` | source | In-flight PII masking |
| `strategy` | source | CDC only: `flatten` \| `changelog` |
| `max_table_nesting` | source | Flatten nested records (`"0"` / `"1"` / `"2"`) |
| `page_size` | source | Rows per extract page (default `50000`) |
| `extract_parallelism` | source | Parallel extract workers (default `5`) |
| `sql_limit` | source | Row cap for sampling |
| `yield_limit` | source | Page-count cap (works for non-SQL too) |
| `sql_exclude_columns` | source | Comma-separated columns to drop |
| `sql_reflection_level` | source | `minimal` \| `full` \| `full_with_precision` |
| `sql_backend` | source | `default` \| `sqlalchemy` \| `pyarrow` \| `connectorx` |
| `service_type`, `*_filter`, `query_log_duration`, `result_limit`, `threads` | source | Metadata / Hera only |
| `dest_table` | sink | Batch SQL/lakehouse: `schema.table`. CDC: **schema only** |
| `incremental_strategy` | sink | `replace` \| `append` \| `merge`. CDC: `append` \| `merge` only |
| `full_refresh` | sink | Reset pipeline cursor state |
| `partition_by` | sink | Iceberg / lakehouse partitions |
| `cluster_by` | sink | Warehouse clustering (list of columns) |
| `loader_file_size` | sink | Rows per loader file (default `100000`) |
| `staging_bucket` | sink | External stage (`s3://` / `gs://`) for BQ / Snowflake / Redshift |
| `aws_region` / `aws_endpoint` | sink | Lakehouse / S3-backed dest |
| `iceberg_metadata_compression` | sink | `gzip` \| `none` |

**Never put these on the wrong side:**

- `incremental_strategy` / `full_refresh` / `partition_by` / `cluster_by` under `source.options`
- `incremental_key` / `primary_key` / `type_hints` / `mask` / `interval_*` under `sink.options`
- Connector-only keys (`api_token`, `survey_ids`, `engine`, `type`) in either options block
- Runtime env knobs (`SCHEMA_NAMING`, `DATA_WRITER__FILE_MAX_BYTES`, `LOAD__WORKERS`) in options — project them as `use.projection.projections.envVars`

Start with `source_table` + `dest_table` + `incremental_strategy`. Add other keys only when there is a concrete need.

`dest_table` shape:

| Destination | `dest_table` |
|---|---|
| Batch SQL / lakehouse | `schema.table` |
| Batch Mongo | `database.collection` |
| Custom source | schema only (`raw`) — resource `table_name` wins |
| **CDC (any dest)** | **schema only** (`testing_nilus`). Loaded table is `{topic}_{src_schema}_{src_table}` |

## `type_hints`

`source.options.type_hints` is a map of **`column_name: type`**. It overrides inference. It does **not** rename columns.

Supported types: `text`, `bigint`, `bool`, `timestamp`, `date`, `decimal`, `double`, `binary`, `json`, `time`.

```yaml
source:
  options:
    source_table: public.users
    type_hints:
      created_at: timestamp
      signup_date: date
      amount: decimal
      payload: json
```

Rules:

- Hint **only** ambiguous or operationally important columns. Do not restate types the source already declares correctly.
- Keys are the **extracted** column names (SQL alias / source field). Destination snake_casing from `SCHEMA_NAMING` is separate.
- `columns` is rejected (`type_hints` replaced it). Type hints are not applied on Debezium/CDC sources.
- Not a rename map. To rename, alias in `query:SELECT … AS …` and set `SCHEMA_NAMING=direct`.
- When a mask changes representation (`hash`, `uuid`, `range`, `month_year`, `sequential`), add a matching type hint (`text` / `bigint`).
- Redshift `SUPER` / nested JSON often needs `{ col: json }`.
- Wide tables (1000+ columns): drop `sql_reflection_level` to `minimal` and hint the columns that matter.

Template: `templates/batch-type-hints.yml`.

## Data masking

Nilus masks **in flight**. The source is unchanged. The destination stores only masked values. There is no automatic unmasked copy.

On `type: nilus`, `mask` belongs in **`source.options`**. The domain does not allow `mask` under `sink.options` (`additionalProperties: false`). Some official pages and the `nilus-cdc-mask` experiment put `mask` on the sink — that **fails apply** on the current `nilus` domain.

**Verified 2026-09-08 on sawan-nilus** (`cdc-mask-skill`, Postgres CDC flatten → Postgres): `source.options.mask` is schema-valid and the service runs, but sink rows are **unmasked** on both snapshot and streaming. Cause: `DebeziumSource.dlt_source()` returns the `cdc_source_flattened` factory; CDC then calls `dlt_source(records)`, which is a new source without the maps attached at startup. Until that path is fixed, **do not use masking on CDC `type: nilus` pipelines**. Use a **batch** pipeline if they need masked dest data.

```yaml
source:
  options:
    source_table: public.users
    type_hints:
      salary: bigint
      registration_date: bigint
    mask:
      email: hash
      phone: "partial:3"
      ssn: ssn
      card_number: credit_card
      salary: "round:5000"
      registration_date: year_only
```

Shape: `column: algorithm` or `column: "algorithm:param"`. Quote values that contain `:`. HMAC keys must not themselves contain `:` (the parser splits on colon).

### Algorithms (runtime)

| Algorithm | Output | Notes |
|---|---|---|
| `hash` / `sha256` | hex text | Deterministic |
| `md5` | hex text | Deterministic |
| `hmac:<key>` | hex text | Deterministic; keep `<key>` simple |
| `email` | `j***e@domain` | Format-preserving |
| `phone` | `555-***-****` | Digits only; short values become `*` |
| `credit_card` | `************1111` | Last 4 |
| `ssn` | `***-**-6789` | Last 4 of a 9-digit value |
| `redact` | `REDACTED` | |
| `stars` | same-length `*` | |
| `fixed:<text>` | constant | Default `MASKED` |
| `partial:<n>` | keep first/last `n` chars | Default `n=2` |
| `first_letter` | `A****` | |
| `uuid` | stable UUID per distinct value **in this run** | Hint `text` |
| `sequential` | stable int per distinct value **in this run** | Hint `bigint` |
| `random` | random same-ish type | Not joinable across runs |
| `round:<n>` | numeric rounded to multiple of `n` | Default `10` |
| `range:<n>` | text bucket `40000-50000` | Hint `text` |
| `noise:<p>` | numeric ± fraction | Default `0.1` |
| `date_shift:<days>` | date shifted by up to `days` | Default `30` |
| `year_only` | integer year | Hint `bigint` |
| `month_year` | `YYYY-MM` | Hint `text` |

Pick by goal:

- Hide PII: `hash`, `redact`, `email`, `phone`, `ssn`, `credit_card`
- Keep joins / testability: `uuid`, `sequential`, `partial:<n>`
- Keep analytics shape: `round`, `range`, `date_shift`, `month_year`, `year_only`

Limitations:

- Masking is not dynamic/row-level security after load.
- Re-run without `mask` if they need originals in the dest.
- Many masked columns add CPU. Do not mask unused columns — drop them with `sql_exclude_columns` instead.
- `uuid` / `sequential` stability is **per run**, not a global token vault.

Template: `templates/batch-mask.yml`. No CDC mask template — masking is a no-op on CDC.

## Incremental and write strategy

Keys on **source**, strategy on **sink**:

```yaml
source:
  options:
    source_table: public.customers
    incremental_key: updated_at
    primary_key: id
sink:
  options:
    dest_table: raw.customers
    incremental_strategy: merge
```

| Strategy | Needs | Use for |
|---|---|---|
| `replace` | nothing | Small snapshots, lookups, first test. **Invalid on CDC** |
| `append` | `incremental_key` to avoid a full re-extract each run | Events, logs, CDC |
| `merge` | `primary_key` (required). `incremental_key` if the extract should be incremental | Mutable entities |

`incremental_key` must be monotonically increasing. Rows updated without touching it are missed. Prefer an indexed timestamp / sequence.

`primary_key` is a string. Composite: `"id,tenant_id"`. If there is no stable identity, do not use `merge`.

`interval_start` / `interval_end` constrain the cursor. They do nothing without `incremental_key` (SQL sources only apply them when that key is set). Formats parsed by Nilus: `2023-01-31`, `2023-01-31T15:00:00`, `2023-01-31T15:00:00+00:00`, `2023-01-31 15:00:00`, plus optional microseconds. `Z` works on Python 3.11+ `%z`.

Custom SQL incrementals must return the key **and** filter in SQL (`where updated_at > :interval_start`). Nilus does not rewrite the query.

`full_refresh: true` (sink) drops **cursor state** so the next run re-extracts history. It is not the same as `replace`. `replace` rewrites the dest table but still honors the incremental cursor. Use `full_refresh` only for a one-off repair; remove it afterwards. Never leave it on a schedule.

Destination surprises:

- Mongo dest: `replace` / `merge` only — `append` raises `Unsupported write disposition 'append'`
- CDC sinks: `append` or `merge` only (`pipeline.py` rejects anything else); `dest_table` is schema only

## Shape

Quote `max_table_nesting` — the domain type is **string**. Nilus sets `resource.max_table_nesting` to that integer (default `0`). That is dlt's **child-table** depth, not a dotted-column flatten switch:

| Value | Runtime effect |
|---|---|
| `"0"` | No child tables. Nested objects stay JSON/complex on the parent (default; see `plusvibeai` comment in code) |
| `"1"` / `"2"` | Create nested child tables up to that depth |

Official shape-knob pages describe `"0"` as “fully flatten to dotted columns.” That contradicts dlt and in-repo comments. Follow the runtime: leave `"0"` unless they explicitly want child tables.

`partition_by` (lakehouse / Iceberg). Add a rule only when consumers filter on that column.

```yaml
sink:
  options:
    dest_table: analytics.orders
    incremental_strategy: append
    partition_by:
      - column: order_date
        type: year          # year | month | day | hour | bucket | identity
        name: order_year
        index: 1            # sort order; examples use 1, 2, …
      - column: country
        type: bucket
        name: country_bucket
        bucket_count: 16    # required when type=bucket
        index: 2
```

Do not `identity`-partition a high-cardinality column (`user_id`). Use `bucket`. Hourly partitions on a low-volume table create tiny files.

`cluster_by` is a **list of column names**. Snowflake / BigQuery / Databricks honor it; many other warehouses no-op.

```yaml
cluster_by:
  - account_id
```

Template: `templates/batch-partition.yml`.

## Sampling and extract width

Use on validation runs, not production schedules.

| Key | Effect |
|---|---|
| `sql_limit` | SQL `LIMIT` — cap rows |
| `yield_limit` | Cap pages (`page_size * yield_limit` ≈ max rows on APIs) |
| `sql_exclude_columns` | Drop columns (`"debug_payload,raw_html"`). Unrelated to `type_hints` |

`sql_reflection_level: minimal` speeds startup on very wide tables; pair with `type_hints` for columns that must be typed correctly.

## Throughput (optional)

Defaults are fine until there is a symptom.

| Symptom | First knob |
|---|---|
| OOM on extract | Lower `page_size` (25k / 10k). Each parallel worker holds a page. |
| Source throttles / memory spikes | Lower `extract_parallelism` |
| Load-phase memory | Lower `loader_file_size` |
| Slow Iceberg write, healthy memory | Project `DATA_WRITER__FILE_MAX_BYTES` (512 MB / 2 GB) and raise `loader_file_size` so the byte cap wins |
| Warehouse load is stream-bound | `sink.options.staging_bucket` |

`page_size` default `50000`. `extract_parallelism` default `5`. `loader_file_size` default `100000`.

`sql_backend` (`default` / `sqlalchemy` / `pyarrow` / `connectorx`) is an advanced SQL extract path. Do not set it unless they asked or a connector page requires it.

## Connector-specific `source_table`

| Kind | `source_table` |
|---|---|
| SQL | `schema.table` |
| Custom SQL | `query:SELECT …` (batch only; not CDC) |
| Jira / Salesforce / Stripe / HubSpot | one logical object (`issues`, `account`, …) |
| Google Sheets | spreadsheet + tab / A1 range |
| Kafka / NATS | topic / JetStream stream name. `run_in_loop` is **not** a domain option — project `RUN_IN_LOOP=true` as an env var if the consumer must stay up |
| Mongo | `database.collection` or `database.collection:[{agg}]` (aggregation wrapper may set nesting `1`) |
| Metadata | do **not** set `source_table` (Hera defaults to `metadata` and the DAG assigns per stage). Set `service_type` + filters |

Read `docs/connectors/<name>.md` (or the matching nilus-book connector page) before inventing object names.

## Schema evolution

- New nullable columns usually appear on the next batch reflect / CDC event.
- Type changes: pin with `type_hints`, or `full_refresh` / new dest table if easier than migrate.
- Keep `primary_key` and CDC `topic.prefix` / `slot.name` stable.
- Nested growth: tune `max_table_nesting` after inspecting a sample payload.

## Defaults

Do not add optional knobs "just in case". Leave `page_size`, `extract_parallelism`, `loader_file_size`, `partition_by`, `cluster_by`, `sql_limit`, and `full_refresh` unset unless the user has a symptom or asked for them.
