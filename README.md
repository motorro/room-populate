# Room-populate [![Check](https://github.com/motorro/room-populate/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/motorro/room-populate/actions/workflows/test.yml)![npm](https://img.shields.io/npm/v/room-populate)
Room-populate is a small Node.js library to pre-populate Room database for Android as described in 
[Room documentation](https://developer.android.com/training/data-storage/room/prepopulate).

## Introduction
See [room-populate-demo](https://github.com/motorro/room-populate-demo) project to see it in action

## Usage
Installation:
```shell script
npm install --save-dev room-populate
```
There is a single template-function `populate`:
```typescript
    async  function createDb() {
        const db: Database = new Database("db.db");

        await populate("app/scr/schemas/1.json", db, function(this: Database): Promise<void> {
            return new Promise<void>(function(resolve, reject) {
                this.exec("INSERT INTO `playlists` (id, title, genre) VALUES (1, 'SAMPLE', 'JAZZ')", (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });

        db.close();
    }
```
The function performs:
1.  Reads your schema
2.  Sets-up a database with room setup
3.  Creates tables
4.  Populates tables with your statements supplied to `populate`
5.  Creates indices
6.  Creates views

If you need to alter creation/population order use `RoomDbCreator` to perform actions the way you prefer.

## License
```
MIT License

Copyright (c) 2020 Nikolai Kotchetkov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
