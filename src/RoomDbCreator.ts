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

/**
 * Room database
 */
import {room, Schema} from "./schema/Schema";
import Entity = room.Entity;
import {Database, Statement} from "sqlite3";
import Index = room.Index;
import View = room.View;

export class RoomDbCreator {
    /**
     * Database schema
     */
    private readonly schema: Schema;

    /**
     * Database
     */
    private readonly db: Database;

    /**
     * Creates
     * @param {Schema} schema Schema definition
     * @param db Created database
     */
    constructor(schema: Schema, db: Database) {
        this.schema = schema;
        this.db = db;
    }

    /**
     * Runs setup queries
     */
    async setup(): Promise<void> {
        return this.schema.database.setupQueries.reduce<Promise<void>>(
            (soFar, query) => soFar.then(() => this.executeCreationSql(query)),
            Promise.resolve()
        );
    }

    /**
     * Creates table structure
     */
    async createTables(): Promise<void> {
        return this.schema.database.entities.reduce<Promise<void>>(
            (soFar, entity) => soFar.then(() => this.createTable(entity)),
            Promise.resolve()
        );
    }

    /**
     * Populates database with data
     * @param block Populating block
     */
    async populate(block: (this: Database) => Promise<void>): Promise<void> {
        return block.call(this.db);
    }

    /**
     * Creates database indices
     */
    async createIndices(): Promise<void> {
        return this.schema.database.entities.reduce<Promise<void>>(
            (soFar, entity) => soFar.then(() => {
                return entity.indices.reduce(
                    (soFar, index) => soFar.then(() =>  this.createIndex(entity, index)),
                    soFar
                )
            }),
            Promise.resolve()
        );
    }

    /**
     * Creates database views
     */
    async createViews(): Promise<void> {
        return this.schema.database.views.reduce<Promise<void>>(
            (soFar, view) => soFar.then(() => this.createView(view)),
            Promise.resolve()
        );
    }

    /**
     * Executes creation SQL
     * @param sql SQL to execute
     */
    private executeCreationSql(sql: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.exec(
                sql,
                function (this: Statement, err: Error | null) {
                    if (null == err) {
                        resolve();
                    } else {
                        reject(err);
                    }
                }
            );
        });
    }

    /**
     * Creates table using entity definition
     * @param entity Entity definition
     */
    private createTable(entity: Entity): Promise<void> {
        return this.executeCreationSql(entity.createSql.replace("${TABLE_NAME}", entity.tableName));
    }

    /**
     * Creates table index using index definition
     * @param entity Entity definition
     * @param index Index definition
     */
    private createIndex(entity: Entity, index: Index): Promise<void> {
        return this.executeCreationSql(index.createSql.replace("${TABLE_NAME}", entity.tableName));
    }

    /**
     * Creates table index using index definition
     * @param view View definition
     */
    private createView(view: View): Promise<void> {
        return this.executeCreationSql(view.createSql.replace("${VIEW_NAME}", view.viewName));
    }
}