import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:28
* @route '/settings/operations'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/operations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:28
* @route '/settings/operations'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:28
* @route '/settings/operations'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:28
* @route '/settings/operations'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:28
* @route '/settings/operations'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:28
* @route '/settings/operations'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:28
* @route '/settings/operations'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Operations\OperationsController::verify
* @see app/Http/Controllers/Operations/OperationsController.php:199
* @route '/settings/operations/verify'
*/
export const verify = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

verify.definition = {
    methods: ["post"],
    url: '/settings/operations/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Operations\OperationsController::verify
* @see app/Http/Controllers/Operations/OperationsController.php:199
* @route '/settings/operations/verify'
*/
verify.url = (options?: RouteQueryOptions) => {
    return verify.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Operations\OperationsController::verify
* @see app/Http/Controllers/Operations/OperationsController.php:199
* @route '/settings/operations/verify'
*/
verify.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::verify
* @see app/Http/Controllers/Operations/OperationsController.php:199
* @route '/settings/operations/verify'
*/
const verifyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verify.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::verify
* @see app/Http/Controllers/Operations/OperationsController.php:199
* @route '/settings/operations/verify'
*/
verifyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verify.url(options),
    method: 'post',
})

verify.form = verifyForm

/**
* @see \App\Http\Controllers\Operations\OperationsController::users
* @see app/Http/Controllers/Operations/OperationsController.php:35
* @route '/settings/operations/users'
*/
export const users = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: users.url(options),
    method: 'get',
})

users.definition = {
    methods: ["get","head"],
    url: '/settings/operations/users',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Operations\OperationsController::users
* @see app/Http/Controllers/Operations/OperationsController.php:35
* @route '/settings/operations/users'
*/
users.url = (options?: RouteQueryOptions) => {
    return users.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Operations\OperationsController::users
* @see app/Http/Controllers/Operations/OperationsController.php:35
* @route '/settings/operations/users'
*/
users.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: users.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::users
* @see app/Http/Controllers/Operations/OperationsController.php:35
* @route '/settings/operations/users'
*/
users.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: users.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::users
* @see app/Http/Controllers/Operations/OperationsController.php:35
* @route '/settings/operations/users'
*/
const usersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: users.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::users
* @see app/Http/Controllers/Operations/OperationsController.php:35
* @route '/settings/operations/users'
*/
usersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: users.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::users
* @see app/Http/Controllers/Operations/OperationsController.php:35
* @route '/settings/operations/users'
*/
usersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: users.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

users.form = usersForm

/**
* @see \App\Http\Controllers\Operations\OperationsController::sessions
* @see app/Http/Controllers/Operations/OperationsController.php:70
* @route '/settings/operations/sessions'
*/
export const sessions = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sessions.url(options),
    method: 'get',
})

sessions.definition = {
    methods: ["get","head"],
    url: '/settings/operations/sessions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Operations\OperationsController::sessions
* @see app/Http/Controllers/Operations/OperationsController.php:70
* @route '/settings/operations/sessions'
*/
sessions.url = (options?: RouteQueryOptions) => {
    return sessions.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Operations\OperationsController::sessions
* @see app/Http/Controllers/Operations/OperationsController.php:70
* @route '/settings/operations/sessions'
*/
sessions.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sessions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::sessions
* @see app/Http/Controllers/Operations/OperationsController.php:70
* @route '/settings/operations/sessions'
*/
sessions.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sessions.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::sessions
* @see app/Http/Controllers/Operations/OperationsController.php:70
* @route '/settings/operations/sessions'
*/
const sessionsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: sessions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::sessions
* @see app/Http/Controllers/Operations/OperationsController.php:70
* @route '/settings/operations/sessions'
*/
sessionsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: sessions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::sessions
* @see app/Http/Controllers/Operations/OperationsController.php:70
* @route '/settings/operations/sessions'
*/
sessionsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: sessions.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

sessions.form = sessionsForm

/**
* @see \App\Http\Controllers\Operations\OperationsController::openSession
* @see app/Http/Controllers/Operations/OperationsController.php:168
* @route '/settings/operations/sessions/{session}/open'
*/
export const openSession = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: openSession.url(args, options),
    method: 'post',
})

openSession.definition = {
    methods: ["post"],
    url: '/settings/operations/sessions/{session}/open',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Operations\OperationsController::openSession
* @see app/Http/Controllers/Operations/OperationsController.php:168
* @route '/settings/operations/sessions/{session}/open'
*/
openSession.url = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { session: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { session: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            session: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        session: typeof args.session === 'object'
        ? args.session.id
        : args.session,
    }

    return openSession.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Operations\OperationsController::openSession
* @see app/Http/Controllers/Operations/OperationsController.php:168
* @route '/settings/operations/sessions/{session}/open'
*/
openSession.post = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: openSession.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::openSession
* @see app/Http/Controllers/Operations/OperationsController.php:168
* @route '/settings/operations/sessions/{session}/open'
*/
const openSessionForm = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: openSession.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::openSession
* @see app/Http/Controllers/Operations/OperationsController.php:168
* @route '/settings/operations/sessions/{session}/open'
*/
openSessionForm.post = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: openSession.url(args, options),
    method: 'post',
})

openSession.form = openSessionForm

/**
* @see \App\Http\Controllers\Operations\OperationsController::showSession
* @see app/Http/Controllers/Operations/OperationsController.php:145
* @route '/settings/operations/sessions/{session}'
*/
export const showSession = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showSession.url(args, options),
    method: 'get',
})

showSession.definition = {
    methods: ["get","head"],
    url: '/settings/operations/sessions/{session}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Operations\OperationsController::showSession
* @see app/Http/Controllers/Operations/OperationsController.php:145
* @route '/settings/operations/sessions/{session}'
*/
showSession.url = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { session: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { session: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            session: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        session: typeof args.session === 'object'
        ? args.session.id
        : args.session,
    }

    return showSession.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Operations\OperationsController::showSession
* @see app/Http/Controllers/Operations/OperationsController.php:145
* @route '/settings/operations/sessions/{session}'
*/
showSession.get = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showSession.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::showSession
* @see app/Http/Controllers/Operations/OperationsController.php:145
* @route '/settings/operations/sessions/{session}'
*/
showSession.head = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showSession.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::showSession
* @see app/Http/Controllers/Operations/OperationsController.php:145
* @route '/settings/operations/sessions/{session}'
*/
const showSessionForm = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showSession.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::showSession
* @see app/Http/Controllers/Operations/OperationsController.php:145
* @route '/settings/operations/sessions/{session}'
*/
showSessionForm.get = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showSession.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::showSession
* @see app/Http/Controllers/Operations/OperationsController.php:145
* @route '/settings/operations/sessions/{session}'
*/
showSessionForm.head = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showSession.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

showSession.form = showSessionForm

/**
* @see \App\Http\Controllers\Operations\OperationsController::correctGame
* @see app/Http/Controllers/Operations/OperationsController.php:232
* @route '/settings/operations/games/{game}'
*/
export const correctGame = (args: { game: number | { id: number } } | [game: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: correctGame.url(args, options),
    method: 'patch',
})

correctGame.definition = {
    methods: ["patch"],
    url: '/settings/operations/games/{game}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Operations\OperationsController::correctGame
* @see app/Http/Controllers/Operations/OperationsController.php:232
* @route '/settings/operations/games/{game}'
*/
correctGame.url = (args: { game: number | { id: number } } | [game: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { game: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { game: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            game: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        game: typeof args.game === 'object'
        ? args.game.id
        : args.game,
    }

    return correctGame.definition.url
            .replace('{game}', parsedArgs.game.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Operations\OperationsController::correctGame
* @see app/Http/Controllers/Operations/OperationsController.php:232
* @route '/settings/operations/games/{game}'
*/
correctGame.patch = (args: { game: number | { id: number } } | [game: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: correctGame.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::correctGame
* @see app/Http/Controllers/Operations/OperationsController.php:232
* @route '/settings/operations/games/{game}'
*/
const correctGameForm = (args: { game: number | { id: number } } | [game: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: correctGame.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::correctGame
* @see app/Http/Controllers/Operations/OperationsController.php:232
* @route '/settings/operations/games/{game}'
*/
correctGameForm.patch = (args: { game: number | { id: number } } | [game: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: correctGame.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

correctGame.form = correctGameForm

/**
* @see \App\Http\Controllers\Operations\OperationsController::audits
* @see app/Http/Controllers/Operations/OperationsController.php:179
* @route '/settings/operations/audits'
*/
export const audits = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: audits.url(options),
    method: 'get',
})

audits.definition = {
    methods: ["get","head"],
    url: '/settings/operations/audits',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Operations\OperationsController::audits
* @see app/Http/Controllers/Operations/OperationsController.php:179
* @route '/settings/operations/audits'
*/
audits.url = (options?: RouteQueryOptions) => {
    return audits.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Operations\OperationsController::audits
* @see app/Http/Controllers/Operations/OperationsController.php:179
* @route '/settings/operations/audits'
*/
audits.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: audits.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::audits
* @see app/Http/Controllers/Operations/OperationsController.php:179
* @route '/settings/operations/audits'
*/
audits.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: audits.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::audits
* @see app/Http/Controllers/Operations/OperationsController.php:179
* @route '/settings/operations/audits'
*/
const auditsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: audits.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::audits
* @see app/Http/Controllers/Operations/OperationsController.php:179
* @route '/settings/operations/audits'
*/
auditsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: audits.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::audits
* @see app/Http/Controllers/Operations/OperationsController.php:179
* @route '/settings/operations/audits'
*/
auditsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: audits.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

audits.form = auditsForm

/**
* @see \App\Http\Controllers\Operations\OperationsController::issueRecoveryCode
* @see app/Http/Controllers/Operations/OperationsController.php:208
* @route '/settings/operations/users/{user}/recovery-code'
*/
export const issueRecoveryCode = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: issueRecoveryCode.url(args, options),
    method: 'post',
})

issueRecoveryCode.definition = {
    methods: ["post"],
    url: '/settings/operations/users/{user}/recovery-code',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Operations\OperationsController::issueRecoveryCode
* @see app/Http/Controllers/Operations/OperationsController.php:208
* @route '/settings/operations/users/{user}/recovery-code'
*/
issueRecoveryCode.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { user: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            user: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        user: typeof args.user === 'object'
        ? args.user.id
        : args.user,
    }

    return issueRecoveryCode.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Operations\OperationsController::issueRecoveryCode
* @see app/Http/Controllers/Operations/OperationsController.php:208
* @route '/settings/operations/users/{user}/recovery-code'
*/
issueRecoveryCode.post = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: issueRecoveryCode.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::issueRecoveryCode
* @see app/Http/Controllers/Operations/OperationsController.php:208
* @route '/settings/operations/users/{user}/recovery-code'
*/
const issueRecoveryCodeForm = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: issueRecoveryCode.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::issueRecoveryCode
* @see app/Http/Controllers/Operations/OperationsController.php:208
* @route '/settings/operations/users/{user}/recovery-code'
*/
issueRecoveryCodeForm.post = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: issueRecoveryCode.url(args, options),
    method: 'post',
})

issueRecoveryCode.form = issueRecoveryCodeForm

const OperationsController = { index, verify, users, sessions, openSession, showSession, correctGame, audits, issueRecoveryCode }

export default OperationsController