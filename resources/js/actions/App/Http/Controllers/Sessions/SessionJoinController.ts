import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Sessions\SessionJoinController::store
* @see app/Http/Controllers/Sessions/SessionJoinController.php:12
* @route '/sessions/join'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/sessions/join',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Sessions\SessionJoinController::store
* @see app/Http/Controllers/Sessions/SessionJoinController.php:12
* @route '/sessions/join'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Sessions\SessionJoinController::store
* @see app/Http/Controllers/Sessions/SessionJoinController.php:12
* @route '/sessions/join'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Sessions\SessionJoinController::store
* @see app/Http/Controllers/Sessions/SessionJoinController.php:12
* @route '/sessions/join'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Sessions\SessionJoinController::store
* @see app/Http/Controllers/Sessions/SessionJoinController.php:12
* @route '/sessions/join'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const SessionJoinController = { store }

export default SessionJoinController