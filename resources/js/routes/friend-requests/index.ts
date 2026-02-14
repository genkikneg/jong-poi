import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Friends\FriendRequestController::store
* @see app/Http/Controllers/Friends/FriendRequestController.php:15
* @route '/friend-requests'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/friend-requests',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Friends\FriendRequestController::store
* @see app/Http/Controllers/Friends/FriendRequestController.php:15
* @route '/friend-requests'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Friends\FriendRequestController::store
* @see app/Http/Controllers/Friends/FriendRequestController.php:15
* @route '/friend-requests'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Friends\FriendRequestController::store
* @see app/Http/Controllers/Friends/FriendRequestController.php:15
* @route '/friend-requests'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Friends\FriendRequestController::store
* @see app/Http/Controllers/Friends/FriendRequestController.php:15
* @route '/friend-requests'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Friends\FriendRequestController::accept
* @see app/Http/Controllers/Friends/FriendRequestController.php:32
* @route '/friend-requests/{friendRequest}/accept'
*/
export const accept = (args: { friendRequest: number | { id: number } } | [friendRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: accept.url(args, options),
    method: 'patch',
})

accept.definition = {
    methods: ["patch"],
    url: '/friend-requests/{friendRequest}/accept',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Friends\FriendRequestController::accept
* @see app/Http/Controllers/Friends/FriendRequestController.php:32
* @route '/friend-requests/{friendRequest}/accept'
*/
accept.url = (args: { friendRequest: number | { id: number } } | [friendRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { friendRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { friendRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            friendRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        friendRequest: typeof args.friendRequest === 'object'
        ? args.friendRequest.id
        : args.friendRequest,
    }

    return accept.definition.url
            .replace('{friendRequest}', parsedArgs.friendRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Friends\FriendRequestController::accept
* @see app/Http/Controllers/Friends/FriendRequestController.php:32
* @route '/friend-requests/{friendRequest}/accept'
*/
accept.patch = (args: { friendRequest: number | { id: number } } | [friendRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: accept.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Friends\FriendRequestController::accept
* @see app/Http/Controllers/Friends/FriendRequestController.php:32
* @route '/friend-requests/{friendRequest}/accept'
*/
const acceptForm = (args: { friendRequest: number | { id: number } } | [friendRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accept.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Friends\FriendRequestController::accept
* @see app/Http/Controllers/Friends/FriendRequestController.php:32
* @route '/friend-requests/{friendRequest}/accept'
*/
acceptForm.patch = (args: { friendRequest: number | { id: number } } | [friendRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accept.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

accept.form = acceptForm

/**
* @see \App\Http\Controllers\Friends\FriendRequestController::destroy
* @see app/Http/Controllers/Friends/FriendRequestController.php:54
* @route '/friend-requests/{friendRequest}'
*/
export const destroy = (args: { friendRequest: number | { id: number } } | [friendRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/friend-requests/{friendRequest}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Friends\FriendRequestController::destroy
* @see app/Http/Controllers/Friends/FriendRequestController.php:54
* @route '/friend-requests/{friendRequest}'
*/
destroy.url = (args: { friendRequest: number | { id: number } } | [friendRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { friendRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { friendRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            friendRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        friendRequest: typeof args.friendRequest === 'object'
        ? args.friendRequest.id
        : args.friendRequest,
    }

    return destroy.definition.url
            .replace('{friendRequest}', parsedArgs.friendRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Friends\FriendRequestController::destroy
* @see app/Http/Controllers/Friends/FriendRequestController.php:54
* @route '/friend-requests/{friendRequest}'
*/
destroy.delete = (args: { friendRequest: number | { id: number } } | [friendRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Friends\FriendRequestController::destroy
* @see app/Http/Controllers/Friends/FriendRequestController.php:54
* @route '/friend-requests/{friendRequest}'
*/
const destroyForm = (args: { friendRequest: number | { id: number } } | [friendRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Friends\FriendRequestController::destroy
* @see app/Http/Controllers/Friends/FriendRequestController.php:54
* @route '/friend-requests/{friendRequest}'
*/
destroyForm.delete = (args: { friendRequest: number | { id: number } } | [friendRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const friendRequests = {
    store: Object.assign(store, store),
    accept: Object.assign(accept, accept),
    destroy: Object.assign(destroy, destroy),
}

export default friendRequests