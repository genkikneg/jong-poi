import FriendController from './FriendController'
import FriendRequestController from './FriendRequestController'

const Friends = {
    FriendController: Object.assign(FriendController, FriendController),
    FriendRequestController: Object.assign(FriendRequestController, FriendRequestController),
}

export default Friends