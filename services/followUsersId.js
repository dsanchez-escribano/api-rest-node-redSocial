const Follow = require("../models/follow");

const followUsersId = async(identityUserId) => {
    
    let following = await Follow.find({"user": identityUserId})
                                .select({"_id":0, "followed":1})
                                .exec()
    let followers = await Follow.find({"user": identityUserId})
                                .select({"_id":0, "user":1})
                                .exec()
    
    let followingClean = [];

    following.forEach(follow =>{
        followingClean.push(follow.followed)
    });

    let followersClean = []
    followers .forEach(follow =>{
        followersClean.push(follow.user)
    });
    return{
        following: followingClean,
        followers: followersClean
    }

}

const followThisUser = async(identityUserId, profileUserId) => {

}
module.exports = {
    followUsersId,
    followThisUser
} 