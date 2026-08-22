import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Sessions\SessionViewController::view
* @see app/Http/Controllers/Sessions/SessionViewController.php:33
* @route '/sessions/join'
*/
export const view = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(options),
    method: 'get',
})

view.definition = {
    methods: ["get","head"],
    url: '/sessions/join',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::view
* @see app/Http/Controllers/Sessions/SessionViewController.php:33
* @route '/sessions/join'
*/
view.url = (options?: RouteQueryOptions) => {
    return view.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::view
* @see app/Http/Controllers/Sessions/SessionViewController.php:33
* @route '/sessions/join'
*/
view.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::view
* @see app/Http/Controllers/Sessions/SessionViewController.php:33
* @route '/sessions/join'
*/
view.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: view.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::view
* @see app/Http/Controllers/Sessions/SessionViewController.php:33
* @route '/sessions/join'
*/
const viewForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: view.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::view
* @see app/Http/Controllers/Sessions/SessionViewController.php:33
* @route '/sessions/join'
*/
viewForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: view.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::view
* @see app/Http/Controllers/Sessions/SessionViewController.php:33
* @route '/sessions/join'
*/
viewForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: view.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

view.form = viewForm
