import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
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

const SessionController = { store, show, close }

export default SessionController