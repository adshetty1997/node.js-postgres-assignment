var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "users",
    tableName: "users",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        name: {
            type: "varchar",
            enum:true,
        },
        role: {
            type: "varchar",
        },
        email: {
            type: "varchar",
        },
        password: {
            type: "varchar",
        },
        feedsList: {
            type: "int",
            array: true,
        },
        deleteFeedPermission: {
            type:"bool",
            default:false,
        }
    },
    relations: {
        feeds: {
            target: "feeds",
            type: "many-to-many",
            joinTable: true,
        },
    },
})