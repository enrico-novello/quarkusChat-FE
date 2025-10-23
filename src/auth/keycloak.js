import { UserManager } from 'oidc-client-ts';

const config = {
  authority: 'http://localhost:8081/realms/quarkus-chat',
  client_id: 'quarkus-chat-app',
  client_secret: '9tjfLPBQhgm6LUaVEdAWQx4o6Qo5Ezgj',
  redirect_uri: 'http://localhost:5173/callback',
  response_type: 'code',
  scope: 'openid profile email',
  post_logout_redirect_uri: 'http://localhost:5173/',
};

export const userManager = new UserManager(config);