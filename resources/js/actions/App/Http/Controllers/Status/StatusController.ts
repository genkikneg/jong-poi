import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Status\StatusController::index
* @see app/Http/Controllers/Status/StatusController.php:13
* @route '/status'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Status\StatusController::index
* @see app/Http/Controllers/Status/StatusController.php:13
* @route '/status'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Status\StatusController::index
* @see app/Http/Controllers/Status/StatusController.php:13
* @route '/status'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Status\StatusController::index
* @see app/Http/Controllers/Status/StatusController.php:13
* @route '/status'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Status\StatusController::index
* @see app/Http/Controllers/Status/StatusController.php:13
* @route '/status'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Status\StatusController::index
* @see app/Http/Controllers/Status/StatusController.php:13
* @route '/status'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Status\StatusController::index
* @see app/Http/Controllers/Status/StatusController.php:13
* @route '/status'
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

const StatusController = { index }

export default StatusController