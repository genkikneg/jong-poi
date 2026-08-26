import RecoveryController from './RecoveryController'
import UserAvatarController from './UserAvatarController'
import Status from './Status'
import Rankings from './Rankings'
import Sessions from './Sessions'
import Settings from './Settings'
import Operations from './Operations'
import Friends from './Friends'

const Controllers = {
    RecoveryController: Object.assign(RecoveryController, RecoveryController),
    UserAvatarController: Object.assign(UserAvatarController, UserAvatarController),
    Status: Object.assign(Status, Status),
    Rankings: Object.assign(Rankings, Rankings),
    Sessions: Object.assign(Sessions, Sessions),
    Settings: Object.assign(Settings, Settings),
    Operations: Object.assign(Operations, Operations),
    Friends: Object.assign(Friends, Friends),
}

export default Controllers