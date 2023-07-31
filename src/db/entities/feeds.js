var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "feeds", // Will use table name `category` as default behaviour.
    tableName: "feeds", // Optional: Provide `tableName` property to override the default behaviour for table name.
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        name: {
            type: "varchar",
        },
        url: {
            type: "varchar",
        },
        description: {
            type: "varchar",
        },
    },
})