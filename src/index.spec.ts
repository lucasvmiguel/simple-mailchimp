import { expect } from 'chai';
import * as nock from 'nock'

import * as mailchimp from './index';

import getUserResponse from '../test/mocks/get-user-response';
import emptyGetUserResponse from '../test/mocks/empty-get-user-response';
import createUserResponse from '../test/mocks/create-user-response';
import clientParamsMock from '../test/mocks/client-params';
import userMock from '../test/mocks/user';


describe('index', () => {
  const client = new mailchimp.Client(clientParamsMock);

  it('addOrGetUser user already created', async () => {
    nock('http://sample.com')
      .get('/search-members?list_id=test-list-id&query=test-email-lucas@gmail.com')
      .reply(200, getUserResponse);

    const test = {
      params: userMock,
      expected: userMock
    };

    const result = await client.addOrGetUser(test.params);
    expect(result).to.be.deep.equal(test.expected);
  });

  it('addOrGetUser new user', async () => {
    nock('http://sample.com')
      .get('/search-members?list_id=test-list-id&query=test-email-lucas@gmail.com')
      .reply(200, emptyGetUserResponse);

    nock('http://sample.com')
      .post('/lists/test-list-id/members')
      .reply(200, createUserResponse);

    const test = {
      params: userMock,
      expected: userMock
    };

    const result = await client.addOrGetUser(test.params);
    expect(result).to.be.deep.equal(test.expected);
  });

  it('getUser got one', async () => {
    nock('http://sample.com')
      .get('/search-members?list_id=test-list-id&query=test-email-lucas@gmail.com')
      .reply(200, getUserResponse);

    const test = {
      params: 'test-email-lucas@gmail.com',
      expected: userMock
    };

    const result = await client.getUser(test.params);
    expect(result).to.be.deep.equal(test.expected);
  });

  it('getUser empty', async () => {
    nock('http://sample.com')
      .get('/search-members?list_id=test-list-id&query=test-email-lucas@gmail.com')
      .reply(200, emptyGetUserResponse);

    const test = {
      params: 'test-email-lucas@gmail.com',
      expected: null
    };

    const result = await client.getUser(test.params);
    expect(result).to.be.deep.equal(test.expected);
  });

  it('editUserTags user exist', async () => {
    nock('http://sample.com')
      .get('/search-members?list_id=test-list-id&query=test-email-lucas@gmail.com')
      .reply(200, getUserResponse);

    nock('http://sample.com')
      .post('/lists/test-list-id/members/test-id/tags')
      .reply(204);

    const test = {
      params: {
        email: 'test-email-lucas@gmail.com',
        tags: ['lucas', 'vieira']
      },
      expected: userMock
    };

    const result = await client.editUserTags(test.params.email, test.params.tags);
    expect(result).to.be.deep.equal(test.expected);
  });

  it('editUserTags user does not exist', async () => {
    nock('http://sample.com')
      .get('/search-members?list_id=test-list-id&query=test-email-lucas@gmail.com')
      .reply(200, emptyGetUserResponse);

    const test = {
      params: {
        email: 'test-email-lucas@gmail.com',
        tags: ['lucas', 'vieira']
      },
      expected: null
    };

    const result = await client.editUserTags(test.params.email, test.params.tags);

    expect(result).to.be.deep.equal(test.expected);
  });

  it('editUserExtra user exist', async () => {
    nock('http://sample.com')
      .get('/search-members?list_id=test-list-id&query=test-email-lucas@gmail.com')
      .reply(200, getUserResponse);

    nock('http://sample.com')
      .put('/lists/test-list-id/members/test-id')
      .reply(200);

    const test = {
      params: {
        email: 'test-email-lucas@gmail.com',
        extra: { COMPLETION: 55 }
      },
      expected: { ...userMock, extra: { ...userMock.extra, COMPLETION: 55 } }
    };

    const result = await client.editUserExtra(test.params.email, test.params.extra);
    expect(result).to.be.deep.equal(test.expected);
  });

  it('editUserExtra user does not exist', async () => {
    nock('http://sample.com')
      .get('/search-members?list_id=test-list-id&query=test-email-lucas@gmail.com')
      .reply(200, emptyGetUserResponse);

    const test = {
      params: {
        email: 'test-email-lucas@gmail.com',
        extra: { COMPLETION: 55 }
      },
      expected: null
    };

    const result = await client.editUserExtra(test.params.email, test.params.extra);

    expect(result).to.be.deep.equal(test.expected);
  });
});