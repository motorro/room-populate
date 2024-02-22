/*
 * The MIT License (MIT)
 *
 * Copyright (c)  2020. Nikolai Kotchetkov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

import {Database} from "sqlite3";
import {anyFunction, anyString, instance, mock, verify, when} from "@johanblumenberg/ts-mockito";
import {Schema} from "../src/schema/Schema";
import * as fs from "fs";
import * as path from "path";
import {RoomDbCreator} from "../src/RoomDbCreator";

describe("RoomDbCreator", function () {
    let dbMock: Database;
    let schema: Schema;
    let roomDb: RoomDbCreator;

    beforeEach(function () {
        schema = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "1.json"), { encoding: "utf8"})) as Schema;

        dbMock = mock(Database);
        when(dbMock.exec(anyString(), anyFunction())).thenCall((_sql, callback) => callback());

        roomDb = new RoomDbCreator(schema, instance(dbMock))
    });

    /**
     * Checks for rejection
     * @param block RoomDbCreator call
     */
    function createRejectionTest(block: (this: RoomDbCreator) => Promise<void>): () => Chai.PromisedAssertion {
        return function() {
            const error = new Error("error");
            when(dbMock.exec(anyString(), anyFunction())).thenCall((_sql, callback) => callback(error));
            return block.call(roomDb).should.eventually.be.rejectedWith(error);
        };
    }

    it("should setup database", function () {
        return roomDb.setup()
            .then(function () {
                verify(dbMock.exec(
                    "CREATE TABLE IF NOT EXISTS room_master_table (id INTEGER PRIMARY KEY,identity_hash TEXT)",
                    anyFunction())
                ).once();
                verify(dbMock.exec(
                    "INSERT OR REPLACE INTO room_master_table (id,identity_hash) VALUES(42, 'b209f33eed89e2c294baacf1bea0ec0f')",
                    anyFunction())
                ).once();
            })
            .should.eventually.be.fulfilled;
    });

    it("should fail setup if database fails", createRejectionTest(function(this: RoomDbCreator): Promise<void> {
        return this.setup();
    }));

    it("should create tables", function () {
        return roomDb.createTables()
            .then(function () {
                verify(dbMock.exec(
                    "CREATE TABLE IF NOT EXISTS `playlists` (`id` INTEGER NOT NULL, `title` TEXT NOT NULL, `genre` TEXT NOT NULL, PRIMARY KEY(`id`))",
                    anyFunction())
                ).once();
                verify(dbMock.exec(
                    "CREATE TABLE IF NOT EXISTS `songs` (`id` INTEGER NOT NULL, `playlist` INTEGER, `title` TEXT NOT NULL, `author` TEXT NOT NULL, PRIMARY KEY(`id`), FOREIGN KEY(`playlist`) REFERENCES `playlists`(`id`) ON UPDATE CASCADE ON DELETE CASCADE )",
                    anyFunction())
                ).once();
            })
            .should.eventually.be.fulfilled;
    });

    it("should fail tables if database fails", createRejectionTest(function(this: RoomDbCreator): Promise<void> {
        return this.createTables();
    }));

    it("should populate tables", function () {
        const insert = "INSERT INTO `playlists` (id, title, genre) VALUES (1, 'SAMPLE', 'JAZZ')";
        const populate: (this: Database) => Promise<void> = function (this: Database): Promise<void> {
            this.exec(insert); return Promise.resolve();
        };
        return roomDb.populate(populate)
            .then(function () {
                verify(dbMock.exec(insert)).once();
            })
            .should.eventually.be.fulfilled;
    });

    it("should fail population if database fails", function() {
        const error = new Error("error");
        const populate: (this: Database) => Promise<void> = function (this: Database): Promise<void> {
            return Promise.reject(error);
        };
        return roomDb.populate(populate).should.eventually.be.rejectedWith(error);
    });

    it("should create indices", function () {
        return roomDb.createIndices()
            .then(function () {
                verify(dbMock.exec(
                    "CREATE INDEX IF NOT EXISTS `playlist_title` ON `playlists` (`title`)",
                    anyFunction())
                ).once();
                verify(dbMock.exec(
                    "CREATE INDEX IF NOT EXISTS `playlist_genre` ON `playlists` (`genre`)",
                    anyFunction())
                ).once();
                verify(dbMock.exec(
                    "CREATE INDEX IF NOT EXISTS `song_playlist` ON `songs` (`playlist`)",
                    anyFunction())
                ).once();
            })
            .should.eventually.be.fulfilled;
    });

    it("should fail indices if database fails", createRejectionTest(function(this: RoomDbCreator): Promise<void> {
        return this.createIndices();
    }));

    it("should create views", function () {
        return roomDb.createViews()
            .then(function () {
                verify(dbMock.exec(
                    "CREATE VIEW `titles` AS SELECT songs.title FROM songs",
                    anyFunction())
                ).once();
            })
            .should.eventually.be.fulfilled;
    });

    it("should fail views if database fails", createRejectionTest(function(this: RoomDbCreator): Promise<void> {
        return this.createViews();
    }));
});