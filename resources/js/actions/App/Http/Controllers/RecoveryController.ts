import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\RecoveryController::create
* @see app/Http/Controllers/RecoveryController.php:17
* @route '/recover-account'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/recover-account',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RecoveryController::create
* @see app/Http/Controllers/RecoveryController.php:17
* @route '/recover-account'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecoveryController::create
* @see app/Http/Controllers/RecoveryController.php:17
* @route '/recover-account'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RecoveryController::create
* @see app/Http/Controllers/RecoveryController.php:17
* @route '/recover-account'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RecoveryController::create
* @see app/Http/Controllers/RecoveryController.php:17
* @route '/recover-account'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RecoveryController::create
* @see app/Http/Controllers/RecoveryController.php:17
* @route '/recover-account'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RecoveryController::create
* @see app/Http/Controllers/RecoveryController.php:17
* @route '/recover-account'
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
* @see \App\Http\Controllers\RecoveryController::verify
* @see app/Http/Controllers/RecoveryController.php:24
* @route '/recover-account/verify'
*/
export const verify = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

verify.definition = {
    methods: ["post"],
    url: '/recover-account/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RecoveryController::verify
* @see app/Http/Controllers/RecoveryController.php:24
* @route '/recover-account/verify'
*/
verify.url = (options?: RouteQueryOptions) => {
    return verify.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecoveryController::verify
* @see app/Http/Controllers/RecoveryController.php:24
* @route '/recover-account/verify'
*/
verify.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RecoveryController::verify
* @see app/Http/Controllers/RecoveryController.php:24
* @route '/recover-account/verify'
*/
const verifyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verify.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RecoveryController::verify
* @see app/Http/Controllers/RecoveryController.php:24
* @route '/recover-account/verify'
*/
verifyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verify.url(options),
    method: 'post',
})

verify.form = verifyForm

/**
* @see \App\Http\Controllers\RecoveryController::password
* @see app/Http/Controllers/RecoveryController.php:43
* @route '/recover-account/password'
*/
export const password = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: password.url(options),
    method: 'get',
})

password.definition = {
    methods: ["get","head"],
    url: '/recover-account/password',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RecoveryController::password
* @see app/Http/Controllers/RecoveryController.php:43
* @route '/recover-account/password'
*/
password.url = (options?: RouteQueryOptions) => {
    return password.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecoveryController::password
* @see app/Http/Controllers/RecoveryController.php:43
* @route '/recover-account/password'
*/
password.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: password.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RecoveryController::password
* @see app/Http/Controllers/RecoveryController.php:43
* @route '/recover-account/password'
*/
password.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: password.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RecoveryController::password
* @see app/Http/Controllers/RecoveryController.php:43
* @route '/recover-account/password'
*/
const passwordForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: password.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RecoveryController::password
* @see app/Http/Controllers/RecoveryController.php:43
* @route '/recover-account/password'
*/
passwordForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: password.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RecoveryController::password
* @see app/Http/Controllers/RecoveryController.php:43
* @route '/recover-account/password'
*/
passwordForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: password.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

password.form = passwordForm

/**
* @see \App\Http\Controllers\RecoveryController::store
* @see app/Http/Controllers/RecoveryController.php:56
* @route '/recover-account/password'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/recover-account/password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RecoveryController::store
* @see app/Http/Controllers/RecoveryController.php:56
* @route '/recover-account/password'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecoveryController::store
* @see app/Http/Controllers/RecoveryController.php:56
* @route '/recover-account/password'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RecoveryController::store
* @see app/Http/Controllers/RecoveryController.php:56
* @route '/recover-account/password'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RecoveryController::store
* @see app/Http/Controllers/RecoveryController.php:56
* @route '/recover-account/password'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const RecoveryController = { create, verify, password, store }

export default RecoveryController