const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class InitialSchema1693345579072 {
    name = 'InitialSchema1693345579072'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "account" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" text NOT NULL DEFAULT 'customer', CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "account"`);
    }
}
