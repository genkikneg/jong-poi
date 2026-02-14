import UserAvatarController from './UserAvatarController'
import Status from './Status'
import Sessions from './Sessions'
import Settings from './Settings'
import Friends from './Friends'

const Controllers = {
    UserAvatarController: Object.assign(UserAvatarController, UserAvatarController),
    Status: Object.assign(Status, Status),
    Sessions: Object.assign(Sessions, Sessions),
    Settings: Object.assign(Settings, Settings),
    Friends: Object.assign(Friends, Friends),
}

export default Controllers