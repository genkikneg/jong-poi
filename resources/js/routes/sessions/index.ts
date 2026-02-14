import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import draft from './draft'
import games from './games'
/**
* @see \App\Http\Controllers\Sessions\SessionViewController::create
* @see app/Http/Controllers/Sessions/SessionViewController.php:16
* @route '/sessions/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/sessions/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::create
* @see app/Http/Controllers/Sessions/SessionViewController.php:16
* @route '/sessions/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::create
* @see app/Http/Controllers/Sessions/SessionViewController.php:16
* @route '/sessions/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::create
* @see app/Http/Controllers/Sessions/SessionViewController.php:16
* @route '/sessions/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::create
* @see app/Http/Controllers/Sessions/SessionViewController.php:16
* @route '/sessions/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::create
* @see app/Http/Controllers/Sessions/SessionViewController.php:16
* @route '/sessions/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::create
* @see app/Http/Controllers/Sessions/SessionViewController.php:16
* @route '/sessions/create'
*/
createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

create.form = createForm

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::history
* @see app/Http/Controllers/Sessions/SessionViewController.php:58
* @route '/sessions/history'
*/
export const history = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/sessions/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::history
* @see app/Http/Controllers/Sessions/SessionViewController.php:58
* @route '/sessions/history'
*/
history.url = (options?: RouteQueryOptions) => {
    return history.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::history
* @see app/Http/Controllers/Sessions/SessionViewController.php:58
* @route '/sessions/history'
*/
history.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::history
* @see app/Http/Controllers/Sessions/SessionViewController.php:58
* @route '/sessions/history'
*/
history.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::history
* @see app/Http/Controllers/Sessions/SessionViewController.php:58
* @route '/sessions/history'
*/
const historyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::history
* @see app/Http/Controllers/Sessions/SessionViewController.php:58
* @route '/sessions/history'
*/
historyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::history
* @see app/Http/Controllers/Sessions/SessionViewController.php:58
* @route '/sessions/history'
*/
historyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

history.form = historyForm

/**
* @see \App\Http\Controllers\Sessions\SessionController::store
* @see app/Http/Controllers/Sessions/SessionController.php:18
* @route '/sessions'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/sessions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Sessions\SessionController::store
* @see app/Http/Controllers/Sessions/SessionController.php:18
* @route '/sessions'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Sessions\SessionController::store
* @see app/Http/Controllers/Sessions/SessionController.php:18
* @route '/sessions'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Sessions\SessionController::store
* @see app/Http/Controllers/Sessions/SessionController.php:18
* @route '/sessions'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Sessions\SessionController::store
* @see app/Http/Controllers/Sessions/SessionController.php:18
* @route '/sessions'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Sessions\SessionController::show
* @see app/Http/Controllers/Sessions/SessionController.php:53
* @route '/sessions/{session}'
*/
export const show = (args: { session: string | number | { id: string | number } } | [session: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/sessions/{session}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Sessions\SessionController::show
* @see app/Http/Controllers/Sessions/SessionController.php:53
* @route '/sessions/{session}'
*/
show.url = (args: { session: string | number | { id: string | number } } | [session: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Sessions\SessionController::show
* @see app/Http/Controllers/Sessions/SessionController.php:53
* @route '/sessions/{session}'
*/
show.get = (args: { session: string | number | { id: string | number } } | [session: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionController::show
* @see app/Http/Controllers/Sessions/SessionController.php:53
* @route '/sessions/{session}'
*/
show.head = (args: { session: string | number | { id: string | number } } | [session: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Sessions\SessionController::show
* @see app/Http/Controllers/Sessions/SessionController.php:53
* @route '/sessions/{session}'
*/
const showForm = (args: { session: string | number | { id: string | number } } | [session: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionController::show
* @see app/Http/Controllers/Sessions/SessionController.php:53
* @route '/sessions/{session}'
*/
showForm.get = (args: { session: string | number | { id: string | number } } | [session: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionController::show
* @see app/Http/Controllers/Sessions/SessionController.php:53
* @route '/sessions/{session}'
*/
showForm.head = (args: { session: string | number | { id: string | number } } | [session: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\Sessions\SessionController::close
* @see app/Http/Controllers/Sessions/SessionController.php:194
* @route '/sessions/{session}/close'
*/
export const close = (args: { session: string | number | { id: string | number } } | [session: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: close.url(args, options),
    method: 'patch',
})

close.definition = {
    methods: ["patch"],
    url: '/sessions/{session}/close',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Sessions\SessionController::close
* @see app/Http/Controllers/Sessions/SessionController.php:194
* @route '/sessions/{session}/close'
*/
close.url = (args: { session: string | number | { id: string | number } } | [session: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return close.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Sessions\SessionController::close
* @see app/Http/Controllers/Sessions/SessionController.php:194
* @route '/sessions/{session}/close'
*/
close.patch = (args: { session: string | number | { id: string | number } } | [session: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: close.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Sessions\SessionController::close
* @see app/Http/Controllers/Sessions/SessionController.php:194
* @route '/sessions/{session}/close'
*/
const closeForm = (args: { session: string | number | { id: string | number } } | [session: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: close.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Sessions\SessionController::close
* @see app/Http/Controllers/Sessions/SessionController.php:194
* @route '/sessions/{session}/close'
*/
closeForm.patch = (args: { session: string | number | { id: string | number } } | [session: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: close.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

close.form = closeForm

/**
* @see \App\Http\Controllers\Sessions\SessionJoinController::join
* @see app/Http/Controllers/Sessions/SessionJoinController.php:12
* @route '/sessions/join'
*/
export const join = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: join.url(options),
    method: 'post',
})

join.definition = {
    methods: ["post"],
    url: '/sessions/join',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Sessions\SessionJoinController::join
* @see app/Http/Controllers/Sessions/SessionJoinController.php:12
* @route '/sessions/join'
*/
join.url = (options?: RouteQueryOptions) => {
    return join.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Sessions\SessionJoinController::join
* @see app/Http/Controllers/Sessions/SessionJoinController.php:12
* @route '/sessions/join'
*/
join.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: join.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Sessions\SessionJoinController::join
* @see app/Http/Controllers/Sessions/SessionJoinController.php:12
* @route '/sessions/join'
*/
const joinForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: join.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Sessions\SessionJoinController::join
* @see app/Http/Controllers/Sessions/SessionJoinController.php:12
* @route '/sessions/join'
*/
joinForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: join.url(options),
    method: 'post',
})

join.form = joinForm

const sessions = {
    create: Object.assign(create, create),
    join: Object.assign(join, join),
    history: Object.assign(history, history),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    close: Object.assign(close, close),
    draft: Object.assign(draft, draft),
    games: Object.assign(games, games),
}

export default sessions