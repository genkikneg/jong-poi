import AuthenticatedSessionController from './AuthenticatedSessionController'
import RegisteredUserController from './RegisteredUserController'
import ConfirmablePasswordController from './ConfirmablePasswordController'
import ConfirmedPasswordStatusController from './ConfirmedPasswordStatusController'

const Controllers = {
    AuthenticatedSessionController: Object.assign(AuthenticatedSessionController, AuthenticatedSessionController),
    RegisteredUserController: Object.assign(RegisteredUserController, RegisteredUserController),
    ConfirmablePasswordController: Object.assign(ConfirmablePasswordController, ConfirmablePasswordController),
    ConfirmedPasswordStatusController: Object.assign(ConfirmedPasswordStatusController, ConfirmedPasswordStatusController),
}

export default Controllers