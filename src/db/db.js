const typeorm = require("typeorm");
const path = require("path");

console.log(process.env);

const dataSource = new typeorm.DataSource({
    type: "postgres",
    host: process.env.POSTGRE_HOST,
    port: process.env.POSTGRE_PORT,
    username: process.env.POSTGRE_USER,
    password: (process.env.POSTGRE_PASSWORD).toString(),
    database: process.env.POSTGRE_DATABASE,
    synchronize: true,
    logging: true,
    entities: [path.join(__dirname,"entities/**/*.js")],
});

let userRepository,feedRepository

const initRepositories = async() => {
    userRepository = (await dataSource.getRepository("users"));
    feedRepository = await dataSource.getRepository("feeds");
}

const createUser = async(user) => {
    let userDetails = await userRepository.save(user);
    return userDetails;
}

const findUser = async(query) => {
    let userList = await userRepository.find(query);
    return userList;
}

const updateUser = async(query,update) => {
    let updatedUserDetails = await userRepository.update(query,update);
    return updatedUserDetails;
}

const deleteUser = async(query) => {
    let res = await userRepository.delete(query);
    return res;
}

const createFeed = async(feed) => {
    let feedDetails = await feedRepository.save(feed);
    return feedDetails;
}

const findFeed = async(query) => {
    let feedList = await feedRepository.find(query);
    return feedList;
}

const updateFeed = async(query,update) => {
    let updatedFeedDetails = await feedRepository.update(query,update);
    return updatedFeedDetails;
}

const deleteFeed = async(query) => {
    let res = await feedRepository.delete(query);
    return res;
}


module.exports = {
    dataSource,
    initRepositories,
    createUser,
    findUser,
    updateUser,
    deleteUser,
    createFeed,
    findFeed,
    updateFeed,
    deleteFeed,
};