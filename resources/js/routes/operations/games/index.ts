import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Operations\OperationsController::update
* @see app/Http/Controllers/Operations/OperationsController.php:232
* @route '/settings/operations/games/{game}'
*/
export const update = (args: { game: number | { id: number } } | [game: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/settings/operations/games/{game}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Operations\OperationsController::update
* @see app/Http/Controllers/Operations/OperationsController.php:232
* @route '/settings/operations/games/{game}'
*/
update.url = (args: { game: number | { id: number } } | [game: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { game: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { game: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            game: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        game: typeof args.game === 'object'
        ? args.game.id
        : args.game,
    }

    return update.definition.url
            .replace('{game}', parsedArgs.game.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Operations\OperationsController::update
* @see app/Http/Controllers/Operations/OperationsController.php:232
* @route '/settings/operations/games/{game}'
*/
update.patch = (args: { game: number | { id: number } } | [game: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::update
* @see app/Http/Controllers/Operations/OperationsController.php:232
* @route '/settings/operations/games/{game}'
*/
const updateForm = (args: { game: number | { id: number } } | [game: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Operations\OperationsController::update
* @see app/Http/Controllers/Operations/OperationsController.php:232
* @route '/settings/operations/games/{game}'
*/
updateForm.patch = (args: { game: number | { id: number } } | [game: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const games = {
    update: Object.assign(update, update),
}

export default games