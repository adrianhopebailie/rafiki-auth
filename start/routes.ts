/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

// Admin Routes
// TODO - secure admin routes
Route.group(() => {
  Route.resource('clients', 'ClientsController').apiOnly()
  Route.shallowResource('clients.keys', 'KeysController').apiOnly()
  Route.resource('grants', 'GrantsController').apiOnly()
  Route.resource('tokens', 'TokensController').apiOnly()
})
.prefix('/admin')
.namespace('App/Controllers/Http/Admin')

/**
 * These routes handle the GNAP protocol
 */
Route.group(() => {
  Route.post('/', 'GrantController.requestGrant')
  .as('createRequest')
  .middleware('client:init')
  .middleware('signature')

  Route.group(() => {
    Route.post('/continue/:id', 'GrantController.continueGrant')
    .as('continueRequest')
    Route.patch('/continue/:id', 'GrantController.updateGrant')
    .as('updateRequest')
    Route.delete('/continue/:id', 'GrantController.revokeGrant')
    .as('revokeRequest')
  })
  .middleware('client:continue')
  .middleware('signature')

  Route.group(() => {
    Route.post('/token/:id', 'TokenController.rotateToken' )
    .as('rotateToken')
    Route.delete('/token/:id', 'TokenController.revokeToken' )
    .as('revokeToken')
  })
  .middleware('client:token')
  .middleware('signature')
})
.middleware('json-only')
.prefix('/gnap')
.as('gnap')
.namespace('App/Controllers/Http/Gnap')

/**
 * These routes are for interactions between the AS and the IdP
 * 
 */
Route.group(() => {
  Route.group(() => {
    Route.get('/interact/:id/start/:nonce', 'InteractionsController.start')
    Route.get('/interact/:id/finish/:nonce', 'InteractionsController.finish')
  })
  .prefix('/frontend')
  
  Route.group(() => {
    Route.get('/interact/:interact', 'ConsentController.start')
    Route.post('/interact/:interact', 'ConsentController.finish')
  })
  .prefix('/backend')
})
.namespace('App/Controllers/Http/IdentityProvider')

Route.group(() => {
  Route.get('/', 'IntrospectController.introspect')
})
.prefix('/introspect')
.namespace('App/Controllers/Http/ResourceServer')
