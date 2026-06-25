const subscriptionRepository = require('../repositories/subscription.repository');
const profileRepository = require('../repositories/profile.repository');

class SubscriptionError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

function toggleSubscribe({ followerUsername, followingUsername, subscribe }) {
    if (followerUsername === followingUsername) {
        throw new SubscriptionError('You cannot subscribe to yourself', 400);
    }

    const targetProfile = profileRepository.findByUsername(followingUsername);
    if (!targetProfile) {
        throw new SubscriptionError(`User ${followingUsername} not found`, 44);
    }

    if (subscribe) {
        subscriptionRepository.subscribe(followerUsername, followingUsername);
    } else {
        subscriptionRepository.unsubscribe(followerUsername, followingUsername);
    }

    return profileRepository.findByUsername(followingUsername);
}

function getSubscribers(username) {
    const relations = subscriptionRepository.findSubscribers(username);
    return relations
        .map(rel => profileRepository.findByUsername(rel.followerUsername))
        .filter(Boolean);
}

function getFollowing(username) {
    const relations = subscriptionRepository.findFollowing(username);
    return relations
        .map(rel => profileRepository.findByUsername(rel.followingUsername))
        .filter(Boolean);
}

module.exports = {
    SubscriptionError,
    toggleSubscribe,
    getSubscribers,
    getFollowing
};