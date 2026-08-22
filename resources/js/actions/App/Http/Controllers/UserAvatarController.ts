import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:11
* @route '/avatars/{avatarId}'
*/
const UserAvatarController = (args: { avatarId: string | number } | [avatarId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: UserAvatarController.url(args, options),
    method: 'get',
})

UserAvatarController.definition = {
    methods: ["get","head"],
    url: '/avatars/{avatarId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:11
* @route '/avatars/{avatarId}'
*/
UserAvatarController.url = (args: { avatarId: string | number } | [avatarId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { avatarId: args }
    }

    if (Array.isArray(args)) {
        args = {
            avatarId: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        avatarId: args.avatarId,
    }

    return UserAvatarController.definition.url
            .replace('{avatarId}', parsedArgs.avatarId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:11
* @route '/avatars/{avatarId}'
*/
UserAvatarController.get = (args: { avatarId: string | number } | [avatarId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: UserAvatarController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:11
* @route '/avatars/{avatarId}'
*/
UserAvatarController.head = (args: { avatarId: string | number } | [avatarId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: UserAvatarController.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:11
* @route '/avatars/{avatarId}'
*/
const UserAvatarControllerForm = (args: { avatarId: string | number } | [avatarId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: UserAvatarController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:11
* @route '/avatars/{avatarId}'
*/
UserAvatarControllerForm.get = (args: { avatarId: string | number } | [avatarId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: UserAvatarController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:11
* @route '/avatars/{avatarId}'
*/
UserAvatarControllerForm.head = (args: { avatarId: string | number } | [avatarId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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