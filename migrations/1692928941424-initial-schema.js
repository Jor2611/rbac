const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class InitialSchema1692928941424 {
    name = 'InitialSchema1692928941424'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "account" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, "role" text NOT NULL DEFAULT ('customer'))`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "account"`);
    }
}
