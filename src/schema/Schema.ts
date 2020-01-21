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
 * Room database definition schema
 */
import Database = room.Database;

/**
 * Room [database schema](https://android.googlesource.com/platform/frameworks/support/+/refs/heads/androidx-master-dev/room/migration/src/main/java/androidx/room/migration/bundle)
 */
export interface Schema {
    formatVersion: number;
    database: Database;
}

/**
 * Room database schema definitions
 */
export namespace room {
    /**
     * Database
     */
    export interface Database {
        version: number;
        identityHash: string;
        entities: Array<Entity>;
        views: Array<View>;
        setupQueries: Array<string>;
    }

    /**
     * Entity. The resulting database has a table per entity
     */
    export interface Entity {
        tableName: string;
        createSql: string;
        fields: Array<Field>;
        primaryKey: PrimaryKey;
        indices: Array<Index>;
        foreignKeys: Array<ForeignKey>
    }

    /**
     * Entity with FTS
     */
    export interface FtsEntity extends Entity{
        ftsVersion: string;
        ftsOptions: FtsOptions;
        contentSyncTriggers: Array<string>;
    }

    /**
     * Table field
     */
    export interface Field {
        fieldPath: string;
        columnName: string;
        affinity: string;
        notNull: boolean;
        defaultValue: string;
    }

    /**
     * Primary key definition
     */
    export interface PrimaryKey {
        columnNames: Array<string>;
        autoGenerate: boolean;
    }

    /**
     * Index definition
     */
    export interface Index {
        name: string;
        unique: boolean;
        columnNames: Array<string>;
        createSql: string;
    }

    /**
     * Foreign key definition
     */
    export interface ForeignKey {
        table: string;
        onDelete: string;
        onUpdate: string;
        columns: Array<string>;
        referencedColumns: Array<string>;
    }

    /**
     * View
     */
    export interface View {
        viewName: string;
        createSql: string;
    }

    /**
     * Options for FTS entity
     * @see FtsEntity
     */
    export interface FtsOptions {
        tokenizer: string;
        tokenizerArgs: Array<string>;
        contentTable: string;
        languageIdColumnName: string;
        matchInfo: string;
        notIndexedColumns: Array<string>;
        prefixSizes: Array<number>;
        preferredOrder: string;
    }
}