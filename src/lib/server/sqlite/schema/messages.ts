import { sqliteTable as table, integer, text, index } from "drizzle-orm/sqlite-core"; // integer | real | text | blob | uniqueIndex | index
// https://orm.drizzle.team/docs/column-types/sqlite
//import * as type from "drizzle-orm/sqlite-core";
//import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
// import { sql, eq } from 'drizzle-orm';

export const Message = table(
    "messages",
    {
        id: text('id').notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
        idWhatsapp: text().notNull(),
        // id: integer({ mode: 'number' }).notNull().primaryKey({ autoIncrement: true }),
        // name: text(),
        // surname: text(),
        from: text(),
        text: text(),
        //email: text().notNull(),
        // password: text(),
        //pos: text(),
        // shopDay: integer("shopDay").notNull(),
        // shopMonth: integer("shopMonth").notNull(),
        // shopYear: integer("shopYear").notNull(),
        // shopEuro: integer("shopEuro").notNull(),
        // shopCents: integer("shopCents").notNull(),
        date: integer(),
        // win: integer("win").notNull(),
        // win: integer({ mode: 'boolean' }).notNull(),
        // where: text({ enum: ["shop", "online"] }).default("shop"),
        // dateSubmitfile: text(),
        file: text().default(""),

        // role: text({ enum: ["value1", "value2"] }).default("value1"),
        // status: text({ enum: ["active", "inactive"] }).default("active"),
        // object: text({ mode: 'json' }),
        // ////////////
        createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
        updatedAt: integer({ mode: "timestamp" }).notNull().$onUpdate(() => new Date()),
        // session_id: text(),
        //updatedAt: integer({ mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
        //testUpdate: integer({ mode: "timestamp" }).notNull().$onUpdate(() => new Date()),
        ///// Populate
        //orders: integer().references((): AnySQLiteColumn => users.id), // same as populate
    },
    (table: any) => {
        // INDEXES (index | uniqueIndex)
        return {
            //nameIdx: index("nameIdx").on(table.name),
            fromIdx: index("fromIdx").on(table.from),
            idWhatsappIdx: index("idWhatsappIdx").on(table.idWhatsapp),
        };
    }
);
// MEMO for timestamp
// // Convert timestamp to Date object
// const date = new Date(1730061554); example numbermade with new Date() date no

// // Format as readable date
// console.log(date.toLocaleString());  // Local date and time
// console.log(date.toISOString());     // ISO format

// // Get individual components
// console.log({
//     year: date.getFullYear(),
//     month: date.getMonth() + 1,  // Months are 0-based, so add 1
//     day: date.getDate(),
//     hours: date.getHours(),
//     minutes: date.getMinutes(),
//     seconds: date.getSeconds()
// });
