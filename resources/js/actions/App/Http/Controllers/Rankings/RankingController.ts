import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Rankings\RankingController::__invoke
* @see app/Http/Controllers/Rankings/RankingController.php:18
* @route '/rankings'
*/
const RankingController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RankingController.url(options),
    method: 'get',
})

RankingController.definition = {
    methods: ["get","head"],
    url: '/rankings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Rankings\RankingController::__invoke
* @see app/Http/Controllers/Rankings/RankingController.php:18
* @route '/rankings'
*/
RankingController.url = (options?: RouteQueryOptions) => {
    return RankingController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Rankings\RankingController::__invoke
* @see app/Http/Controllers/Rankings/RankingController.php:18
* @route '/rankings'
*/
RankingController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RankingController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Rankings\RankingController::__invoke
* @see app/Http/Controllers/Rankings/RankingController.php:18
* @route '/rankings'
*/
RankingController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RankingController.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Rankings\RankingController::__invoke
* @see app/Http/Controllers/Rankings/RankingController.php:18
* @route '/rankings'
*/
const RankingControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RankingController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Rankings\RankingController::__invoke
* @see app/Http/Controllers/Rankings/RankingController.php:18
* @route '/rankings'
*/
RankingControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RankingController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Rankings\RankingController::__invoke
* @see app/Http/Controllers/Rankings/RankingController.php:18
* @route '/rankings'
*/
RankingControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RankingController.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

RankingController.form = RankingControllerForm

export default RankingController