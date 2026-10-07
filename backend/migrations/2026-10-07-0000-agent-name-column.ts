import { Knex } from "knex";

// The agent friendly name feature added the `name` column by editing the original
// agent-table migration, so databases created before that never got it.
export async function up(knex: Knex): Promise<void> {
    if (!await knex.schema.hasColumn("agent", "name")) {
        await knex.schema.alterTable("agent", (table) => {
            table.string("name", 255);
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    // No-op: the column is part of the original agent table on newer installs
}
