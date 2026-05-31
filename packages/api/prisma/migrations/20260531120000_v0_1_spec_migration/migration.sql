-- Migrate mcp_servers to the MCP Registry v0.1 / server.json 2025-12-11 shape.
-- Adds version-history support and the official status block; replaces the
-- single `remote` object with a `remotes` array.

-- Drop the old single-version unique constraint on name (a name now has many versions).
DROP INDEX IF EXISTS "mcp_servers_name_key";

-- New server.json fields.
ALTER TABLE "mcp_servers" ADD COLUMN     "title" TEXT;
ALTER TABLE "mcp_servers" ADD COLUMN     "website_url" TEXT;
ALTER TABLE "mcp_servers" ADD COLUMN     "schema_url" TEXT;
ALTER TABLE "mcp_servers" ADD COLUMN     "remotes" JSONB[] DEFAULT ARRAY[]::JSONB[];
ALTER TABLE "mcp_servers" ADD COLUMN     "is_latest" BOOLEAN NOT NULL DEFAULT false;

-- Registry official status block.
ALTER TABLE "mcp_servers" ADD COLUMN     "registry_status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "mcp_servers" ADD COLUMN     "status_message" TEXT;
ALTER TABLE "mcp_servers" ADD COLUMN     "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "mcp_servers" ADD COLUMN     "status_changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill: map legacy maturity status onto the v0.1 registry status.
UPDATE "mcp_servers" SET "registry_status" = 'deprecated' WHERE "status" = 'deprecated';
UPDATE "mcp_servers" SET "registry_status" = 'active'     WHERE "status" <> 'deprecated';

-- Backfill: published_at/status_changed_at from existing timestamps.
UPDATE "mcp_servers" SET "published_at" = "created_at", "status_changed_at" = "updated_at";

-- Backfill: wrap the legacy single `remote` object into the `remotes` array.
UPDATE "mcp_servers"
SET "remotes" = ARRAY["remote"]::JSONB[]
WHERE "remote" IS NOT NULL;

-- Backfill: existing rows are each the latest (and only) version of their name.
UPDATE "mcp_servers" SET "is_latest" = true;

-- Drop the legacy columns now that data has been migrated.
ALTER TABLE "mcp_servers" DROP COLUMN "remote";
ALTER TABLE "mcp_servers" DROP COLUMN "status";

-- Replace the status index with the new registry_status / is_latest indexes.
DROP INDEX IF EXISTS "mcp_servers_status_idx";
DROP INDEX IF EXISTS "mcp_servers_created_at_idx";
CREATE INDEX "mcp_servers_registry_status_idx" ON "mcp_servers"("registry_status");
CREATE INDEX "mcp_servers_is_latest_idx" ON "mcp_servers"("is_latest");

-- Enforce one row per (name, version).
CREATE UNIQUE INDEX "mcp_servers_name_version_key" ON "mcp_servers"("name", "version");
