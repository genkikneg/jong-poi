import SessionViewController from './SessionViewController'
import SessionController from './SessionController'
import SessionJoinController from './SessionJoinController'
import SessionGameDraftController from './SessionGameDraftController'
import GameController from './GameController'

const Sessions = {
    SessionViewController: Object.assign(SessionViewController, SessionViewController),
    SessionController: Object.assign(SessionController, SessionController),
    SessionJoinController: Object.assign(SessionJoinController, SessionJoinController),
    SessionGameDraftController: Object.assign(SessionGameDraftController, SessionGameDraftController),
    GameController: Object.assign(GameController, GameController),
}

export default Sessions