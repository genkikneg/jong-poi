import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:11
* @route '/avatars/{avatarId}'
*/
export const show = (args: { avatarId: string | number } | [avatarId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/avatars/{avatarId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:11
* @route '/avatars/{avatarId}'
*/
show.url = (args: { avatarId: string | number } | [avatarId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{avatarId}', parsedArgs.avatarId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:11
* @route '/avatars/{avatarId}'
*/
show.get = (args: { avatarId: string | number } | [avatarId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:11
* @route '/avatars/{avatarId}'
*/
show.head = (args: { avatarId: string | number } | [avatarId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:11
* @route '/avatars/{avatarId}'
*/
const showForm = (args: { avatarId: string | number } | [avatarId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:11
* @route '/avatars/{avatarId}'
*/
showForm.get = (args: { avatarId: string | number } | [avatarId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserAvatarController::__invoke
* @see app/Http/Controllers/UserAvatarController.php:11
* @route '/avatars/{avatarId}'
*/
showForm.head = (args: { avatarId: string | number } | [avatarId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

const avatars = {
    show: Object.assign(show, show),
}

export default avatars