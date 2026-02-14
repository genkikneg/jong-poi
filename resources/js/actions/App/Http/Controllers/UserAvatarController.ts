import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:12
* @route '/avatars/{user}'
*/
const UserAvatarController = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: UserAvatarController.url(args, options),
    method: 'get',
})

UserAvatarController.definition = {
    methods: ["get","head"],
    url: '/avatars/{user}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:12
* @route '/avatars/{user}'
*/
UserAvatarController.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return UserAvatarController.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:12
* @route '/avatars/{user}'
*/
UserAvatarController.get = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: UserAvatarController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:12
* @route '/avatars/{user}'
*/
UserAvatarController.head = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: UserAvatarController.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:12
* @route '/avatars/{user}'
*/
const UserAvatarControllerForm = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: UserAvatarController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:12
* @route '/avatars/{user}'
*/
UserAvatarControllerForm.get = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: UserAvatarController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:12
* @route '/avatars/{user}'
*/
UserAvatarControllerForm.head = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: UserAvatarController.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

UserAvatarController.form = UserAvatarControllerForm

export default UserAvatarController