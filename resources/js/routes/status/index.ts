import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'

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
    methods: ['get', 'head'],
    url: '/status',
} satisfies RouteDefinition<['get', 'head']>

index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

index.form = indexForm

export default index
