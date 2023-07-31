const userTypes = 
    {
        "super":"super-admin",
        "admin":"admin",
        "basic":"basic",
    }

module.exports = userTypes


// let res = await createUser({
//     name: "Test 1",
//     role: "super",
//     email: "test1@test.com",
//     password: "password",
//     feedsList: []
// });

// let res = await findUser({
//     where: {
//         id:5,
//     }
// });

// let array = [5,7];
// let res = await dbServices.findUser({
//     where: {
//         id: In([...array]) ,
//     }
// });

// let res = await updateUser({
//     id:6,
// },
// {
//     name: "Test 6",
//     email: "test6@test.com"
// });

// let res = await dbServices.updateUser({
//     id:7,
// },
// {
//     feedsList: () => `array_append("feedsList", 11)`
// });

// let res = await dbServices.updateUser({
//     id:7,
// },
// {
//     feedsList: () => `array_remove("feedsList", 4)`
// });

// let res = await deleteUser({
//     id:4
// });