import UserAvatarController from './UserAvatarController'
import Sessions from './Sessions'
import Settings from './Settings'
import Friends from './Friends'

const Controllers = {
    UserAvatarController: Object.assign(UserAvatarController, UserAvatarController),
    Sessions: Object.assign(Sessions, Sessions),
    Settings: Object.assign(Settings, Settings),
    Friends: Object.assign(Friends, Friends),
}

export default Controllers