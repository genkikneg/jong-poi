import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import users from './users'
import sessions from './sessions'
import games from './games'
import audits from './audits'
import recoveryCode from './recovery-code'
/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:29
* @route '/settings/operations'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/operations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:29
* @route '/settings/operations'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:29
* @route '/settings/operations'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:29
* @route '/settings/operations'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:29
* @route '/settings/operations'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:29
* @route '/settings/operations'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::index
* @see app/Http/Controllers/Operations/OperationsController.php:29
* @route '/settings/operations'
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
* @see \App\Http\Controllers\Operations\OperationsController::verify
* @see app/Http/Controllers/Operations/OperationsController.php:200
* @route '/settings/operations/verify'
*/
export const verify = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

verify.definition = {
    methods: ["post"],
    url: '/settings/operations/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Operations\OperationsController::verify
* @see app/Http/Controllers/Operations/OperationsController.php:200
* @route '/settings/operations/verify'
*/
verify.url = (options?: RouteQueryOptions) => {
    return verify.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Operations\OperationsController::verify
* @see app/Http/Controllers/Operations/OperationsController.php:200
* @route '/settings/operations/verify'
*/
verify.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::verify
* @see app/Http/Controllers/Operations/OperationsController.php:200
* @route '/settings/operations/verify'
*/
const verifyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verify.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::verify
* @see app/Http/Controllers/Operations/OperationsController.php:200
* @route '/settings/operations/verify'
*/
verifyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verify.url(options),
    method: 'post',
})

verify.form = verifyForm

const operations = {
    index: Object.assign(index, index),
    verify: Object.assign(verify, verify),
    users: Object.assign(users, users),
    sessions: Object.assign(sessions, sessions),
    games: Object.assign(games, games),
    audits: Object.assign(audits, audits),
    recoveryCode: Object.assign(recoveryCode, recoveryCode),
}

export default operations