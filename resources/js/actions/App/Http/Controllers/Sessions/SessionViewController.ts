import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Sessions\SessionViewController::create
* @see app/Http/Controllers/Sessions/SessionViewController.php:16
* @route '/sessions/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/sessions/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::create
* @see app/Http/Controllers/Sessions/SessionViewController.php:16
* @route '/sessions/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::create
* @see app/Http/Controllers/Sessions/SessionViewController.php:16
* @route '/sessions/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::create
* @see app/Http/Controllers/Sessions/SessionViewController.php:16
* @route '/sessions/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::create
* @see app/Http/Controllers/Sessions/SessionViewController.php:16
* @route '/sessions/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::create
* @see app/Http/Controllers/Sessions/SessionViewController.php:16
* @route '/sessions/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::create
* @see app/Http/Controllers/Sessions/SessionViewController.php:16
* @route '/sessions/create'
*/
createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

create.form = createForm

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::join
* @see app/Http/Controllers/Sessions/SessionViewController.php:34
* @route '/sessions/join'
*/
export const join = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: join.url(options),
    method: 'get',
})

join.definition = {
    methods: ["get","head"],
    url: '/sessions/join',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::join
* @see app/Http/Controllers/Sessions/SessionViewController.php:34
* @route '/sessions/join'
*/
join.url = (options?: RouteQueryOptions) => {
    return join.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::join
* @see app/Http/Controllers/Sessions/SessionViewController.php:34
* @route '/sessions/join'
*/
join.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: join.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::join
* @see app/Http/Controllers/Sessions/SessionViewController.php:34
* @route '/sessions/join'
*/
join.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: join.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::join
* @see app/Http/Controllers/Sessions/SessionViewController.php:34
* @route '/sessions/join'
*/
const joinForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: join.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::join
* @see app/Http/Controllers/Sessions/SessionViewController.php:34
* @route '/sessions/join'
*/
joinForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: join.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::join
* @see app/Http/Controllers/Sessions/SessionViewController.php:34
* @route '/sessions/join'
*/
joinForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: join.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

join.form = joinForm

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::history
* @see app/Http/Controllers/Sessions/SessionViewController.php:59
* @route '/sessions/history'
*/
export const history = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/sessions/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::history
* @see app/Http/Controllers/Sessions/SessionViewController.php:59
* @route '/sessions/history'
*/
history.url = (options?: RouteQueryOptions) => {
    return history.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::history
* @see app/Http/Controllers/Sessions/SessionViewController.php:59
* @route '/sessions/history'
*/
history.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::history
* @see app/Http/Controllers/Sessions/SessionViewController.php:59
* @route '/sessions/history'
*/
history.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::history
* @see app/Http/Controllers/Sessions/SessionViewController.php:59
* @route '/sessions/history'
*/
const historyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::history
* @see app/Http/Controllers/Sessions/SessionViewController.php:59
* @route '/sessions/history'
*/
historyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Sessions\SessionViewController::history
* @see app/Http/Controllers/Sessions/SessionViewController.php:59
* @route '/sessions/history'
*/
historyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

history.form = historyForm

const SessionViewController = { create, join, history }

export default SessionViewController