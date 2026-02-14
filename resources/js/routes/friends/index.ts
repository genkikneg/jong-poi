import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Friends\FriendController::index
* @see app/Http/Controllers/Friends/FriendController.php:13
* @route '/friends'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/friends',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Friends\FriendController::index
* @see app/Http/Controllers/Friends/FriendController.php:13
* @route '/friends'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Friends\FriendController::index
* @see app/Http/Controllers/Friends/FriendController.php:13
* @route '/friends'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Friends\FriendController::index
* @see app/Http/Controllers/Friends/FriendController.php:13
* @route '/friends'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Friends\FriendController::index
* @see app/Http/Controllers/Friends/FriendController.php:13
* @route '/friends'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Friends\FriendController::index
* @see app/Http/Controllers/Friends/FriendController.php:13
* @route '/friends'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Friends\FriendController::index
* @see app/Http/Controllers/Friends/FriendController.php:13
* @route '/friends'
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

const friends = {
    index: Object.assign(index, index),
}

export default friends