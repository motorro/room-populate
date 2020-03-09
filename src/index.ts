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
import {readSchema} from "./schema/readSchema";
import {RoomDbCreator} from "./RoomDbCreator";

/**
 * A template function that initializes and pre-populates a database with Room schema to use in Android application.
 * To use:
 * 1) Export your schema as described in [Room documentation](https://developer.android.com/training/data-storage/room/migrating-db-versions#export-schema)
 * 2) Run this function providing a path to schema and a new SQLite database.
 * 3) Save the result to assets as described in [Room documentation](https://developer.android.com/training/data-storage/room/prepopulate)
 *
 * The function will run the following template:
 * 1) Set-up room internals
 * 2) Create tables
 * 3) Populate tables with your `populate` script
 * 4) Create indices
 * 5) Create views
 * @param schemaPath A path to schema being created
 * @param db A fresh database
 * @param populate The function that executes database inserts
 */
export async function populate(schemaPath: string, db: Database, populate: (this: Database) => Promise<void>) {
    const creator = new RoomDbCreator(await readSchema(schemaPath), db);

    db.serialize();
    await creator.setup();
    await creator.createTables();
    await creator.populate(populate);
    await creator.createIndices();
    await creator.createViews();
    db.parallelize();
}

