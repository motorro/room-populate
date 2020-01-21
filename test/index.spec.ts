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
import {anyFunction, anyString, instance, mock, verify, when} from "ts-mockito";
import {populate} from "../src";
import * as path from "path";

const schemaPath = path.join(__dirname, "data", "1.json");

describe("Populate", function () {
    let dbMock: Database;

    beforeEach(function () {
        dbMock = mock();
        when(dbMock.exec(anyString(), anyFunction())).thenCall((_sql, callback) => callback());
    });

    it("runs template", function () {
        const insert = "INSERT INTO `playlists` VALUES (1, 'SAMPLE', 'JAZZ')";
        const populateScript: (this: Database) => Promise<void> = function (this: Database): Promise<void> {
            this.exec(insert); return Promise.resolve();
        };

        return populate(schemaPath, instance(dbMock), populateScript)
            .then(function () {
                verify(dbMock.exec(
                    "CREATE TABLE IF NOT EXISTS room_master_table (id INTEGER PRIMARY KEY,identity_hash TEXT)",
                    anyFunction())
                ).once();
                verify(dbMock.exec(
                    "INSERT OR REPLACE INTO room_master_table (id,identity_hash) VALUES(42, 'b209f33eed89e2c294baacf1bea0ec0f')",
                    anyFunction())
                ).once();
                verify(dbMock.exec(
                    "CREATE TABLE IF NOT EXISTS `playlists` (`id` INTEGER NOT NULL, `title` TEXT NOT NULL, `genre` TEXT NOT NULL, PRIMARY KEY(`id`))",
                    anyFunction())
                ).once();
                verify(dbMock.exec(
                    "CREATE TABLE IF NOT EXISTS `songs` (`id` INTEGER NOT NULL, `playlist` INTEGER, `title` TEXT NOT NULL, `author` TEXT NOT NULL, PRIMARY KEY(`id`), FOREIGN KEY(`playlist`) REFERENCES `playlists`(`id`) ON UPDATE CASCADE ON DELETE CASCADE )",
                    anyFunction())
                ).once();
                verify(dbMock.exec(insert)).once();
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
                verify(dbMock.exec(
                    "CREATE VIEW `titles` AS SELECT songs.title FROM songs",
                    anyFunction())
                ).once();
            })
            .should.eventually.be.fulfilled;
    });
});

