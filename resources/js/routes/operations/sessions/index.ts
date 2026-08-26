import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:71
* @route '/settings/operations/sessions'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/operations/sessions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:71
* @route '/settings/operations/sessions'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:71
* @route '/settings/operations/sessions'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:71
* @route '/settings/operations/sessions'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:71
* @route '/settings/operations/sessions'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:71
* @route '/settings/operations/sessions'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:71
* @route '/settings/operations/sessions'
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

/**
* @see \App\Http\Controllers\Operations\OperationsController::open
* @see app/Http/Controllers/Operations/OperationsController.php:169
* @route '/settings/operations/sessions/{session}/open'
*/
export const open = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: open.url(args, options),
    method: 'post',
})

open.definition = {
    methods: ["post"],
    url: '/settings/operations/sessions/{session}/open',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Operations\OperationsController::open
* @see app/Http/Controllers/Operations/OperationsController.php:169
* @route '/settings/operations/sessions/{session}/open'
*/
open.url = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { session: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { session: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            session: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        session: typeof args.session === 'object'
        ? args.session.id
        : args.session,
    }

    return open.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Operations\OperationsController::open
* @see app/Http/Controllers/Operations/OperationsController.php:169
* @route '/settings/operations/sessions/{session}/open'
*/
open.post = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: open.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::open
* @see app/Http/Controllers/Operations/OperationsController.php:169
* @route '/settings/operations/sessions/{session}/open'
*/
const openForm = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: open.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::open
* @see app/Http/Controllers/Operations/OperationsController.php:169
* @route '/settings/operations/sessions/{session}/open'
*/
openForm.post = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: open.url(args, options),
    method: 'post',
})

open.form = openForm

/**
* @see \App\Http\Controllers\Operations\OperationsController::show
* @see app/Http/Controllers/Operations/OperationsController.php:146
* @route '/settings/operations/sessions/{session}'
*/
export const show = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/settings/operations/sessions/{session}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Operations\OperationsController::show
* @see app/Http/Controllers/Operations/OperationsController.php:146
* @route '/settings/operations/sessions/{session}'
*/
show.url = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { session: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { session: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            session: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        session: typeof args.session === 'object'
        ? args.session.id
        : args.session,
    }

    return show.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Operations\OperationsController::show
* @see app/Http/Controllers/Operations/OperationsController.php:146
* @route '/settings/operations/sessions/{session}'
*/
show.get = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::show
* @see app/Http/Controllers/Operations/OperationsController.php:146
* @route '/settings/operations/sessions/{session}'
*/
show.head = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::show
* @see app/Http/Controllers/Operations/OperationsController.php:146
* @route '/settings/operations/sessions/{session}'
*/
const showForm = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::show
* @see app/Http/Controllers/Operations/OperationsController.php:146
* @route '/settings/operations/sessions/{session}'
*/
showForm.get = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::show
* @see app/Http/Controllers/Operations/OperationsController.php:146
* @route '/settings/operations/sessions/{session}'
*/
showForm.head = (args: { session: number | { id: number } } | [session: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

const sessions = {
    index: Object.assign(index, index),
    open: Object.assign(open, open),
    show: Object.assign(show, show),
}

export default sessions