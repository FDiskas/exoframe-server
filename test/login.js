// npm packages
const tap = require('tap');
const jwt = require('jsonwebtoken');

// our packages
const {setupServer} = require('../src');
const {auth: authConfig} = require('../config');

const run = async () => {
  // get server
  const server = await setupServer();

  tap.test('Should login with admin username and password', t => {
    const options = {
      method: 'POST',
      url: '/login',
      payload: {
        username: 'admin',
        password: 'admin',
      },
    };

    server.inject(options, response => {
      const result = response.result;

      t.equal(response.statusCode, 200, 'Correct status code');
      t.ok(result.user, 'Has user');
      t.ok(result.token, 'Has token');

      const decodedUser = jwt.verify(result.token, authConfig.privateKey);
      delete decodedUser.iat;
      delete decodedUser.exp;

      t.equal(result.user.username, 'admin', 'Login matches request');
      t.notOk(result.user.password, 'No password included');
      t.deepEqual(result.user, decodedUser, 'User must match token');

      server.stop(t.end);
    });
  });

  tap.test('Should not login with non-existing user', t => {
    const options = {
      method: 'POST',
      url: '/login',
      payload: {
        username: 'dont',
        password: 'exist',
      },
    };

    server.inject(options, response => {
      const result = response.result;

      t.equal(response.statusCode, 401, 'Correct status code');
      t.equal(
        result.error,
        'Incorrect username or password!',
        'Correct error message'
      );

      server.stop(t.end);
    });
  });
};

run();
