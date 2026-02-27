import UserAvatarController from './UserAvatarController'
import Status from './Status'
import Rankings from './Rankings'
import Sessions from './Sessions'
import Settings from './Settings'
import Friends from './Friends'

const Controllers = {
    UserAvatarController: Object.assign(UserAvatarController, UserAvatarController),
    Status: Object.assign(Status, Status),
    Rankings: Object.assign(Rankings, Rankings),
    Sessions: Object.assign(Sessions, Sessions),
    Settings: Object.assign(Settings, Settings),
    Friends: Object.assign(Friends, Friends),
}

export default Controllers