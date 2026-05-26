import { Migration } from '@mikro-orm/migrations';

export class Migration20260526100000 extends Migration {
  override async up(): Promise<void> {
    const indexExists = await this.hasIndex(
      'staffs',
      'staffs_smtp_pass_unique',
    );
    if (indexExists) {
      this.addSql(`
        DROP INDEX \`staffs_smtp_pass_unique\`
        ON \`staffs\`;
      `);
    }

    const columnExists = await this.hasColumn('staffs', 'smtp_pass');
    if (columnExists) {
      this.addSql(`
        ALTER TABLE \`staffs\`
        DROP COLUMN \`smtp_pass\`;
      `);
    }
  }

  override async down(): Promise<void> {
    const columnExists = await this.hasColumn('staffs', 'smtp_pass');
    if (!columnExists) {
      this.addSql(`
        ALTER TABLE \`staffs\`
        ADD COLUMN \`smtp_pass\` VARCHAR(255) NULL AFTER \`password_hash\`;
      `);

      this.addSql(`
        UPDATE \`staffs\`
        SET \`smtp_pass\` = CONCAT('restored-', \`id\`)
        WHERE \`smtp_pass\` IS NULL;
      `);

      this.addSql(`
        ALTER TABLE \`staffs\`
        MODIFY \`smtp_pass\` VARCHAR(255) NOT NULL;
      `);

      this.addSql(`
        CREATE UNIQUE INDEX \`staffs_smtp_pass_unique\`
        ON \`staffs\` (\`smtp_pass\`);
      `);
    }
  }

  private async hasColumn(
    table: string,
    column: string,
  ): Promise<boolean> {
    const result = await this.execute(
      `SELECT COUNT(*) AS cnt
       FROM information_schema.columns
       WHERE table_schema = DATABASE()
         AND table_name = '${table}'
         AND column_name = '${column}'`,
    );
    return Number(result[0]?.cnt) > 0;
  }

  private async hasIndex(
    table: string,
    indexName: string,
  ): Promise<boolean> {
    const result = await this.execute(
      `SELECT COUNT(*) AS cnt
       FROM information_schema.statistics
       WHERE table_schema = DATABASE()
         AND table_name = '${table}'
         AND index_name = '${indexName}'`,
    );
    return Number(result[0]?.cnt) > 0;
  }
}
