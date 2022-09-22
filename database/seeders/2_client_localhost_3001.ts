import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Client from '../../app/Models/Client'
import { GrantState } from '../../app/Models/Grant'
import { AccessType, FinishMethod, ResourceAction, StartMethod } from '../../providers/Gnap/types'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {

  public static developmentOnly = true

  public async run() {
    const client = await Client.create({
      url: 'https://localhost:3001/'
    })

    const grants = await client.related('grants').createMany([{
      state: GrantState.Approved,
      supportedStartMethods: [StartMethod.Redirect],
      finishMethod: FinishMethod.Redirect,
      finishUri: 'https://example.com/finish',
      finishNonce: 'example-client-nonce',
      interactNonce: 'example-interact-nonce',
      continueToken: 'CONTINUE-3',
    }, {
      state: GrantState.Approved,
      supportedStartMethods: [StartMethod.Redirect],
      finishMethod: FinishMethod.Redirect,
      finishUri: 'http://peer-auth:3006/finish',
      finishNonce: 'example-client-nonce',
      interactNonce: 'local-bank-interact-nonce',
      continueToken: 'CONTINUE-4',
    }])

    grants[0].related('accesses').createMany([{
      type: AccessType.IncomingPayment,
      actions: [ResourceAction.Create, ResourceAction.Read, ResourceAction.List],
    },
    {
      type: AccessType.OutgoingPayment,
      actions: [ResourceAction.Create, ResourceAction.Read, ResourceAction.List],
    },
    {
      type: AccessType.Quote,
      actions: [ResourceAction.Create, ResourceAction.Read],
    }])

    grants[1].related('accesses').createMany([{
      type: AccessType.IncomingPayment,
      actions: [ResourceAction.Create, ResourceAction.Read, ResourceAction.List],
    },
    {
      type: AccessType.OutgoingPayment,
      actions: [ResourceAction.Create, ResourceAction.Read, ResourceAction.List],
    },
    {
      type: AccessType.Quote,
      actions: [ResourceAction.Create, ResourceAction.Read],
    }])

    grants[0].related('accessTokens').create({
      value: 'ACCESS-TOKEN-3',
      expiresIn: 100000000,
      revokedAt: DateTime.now()
    })

    grants[1].related('accessTokens').create({
      value: 'ACCESS-TOKEN-4',
      expiresIn: 100000000,
    })

    await client.related('keys').createMany([{
      kid: 'key-1',
      jwk: '{}'
    }, {
      kid: 'key-2',
      jwk: '{}'
    }])

  }
}
