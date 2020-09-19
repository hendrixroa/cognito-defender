import * as cognito from 'amazon-cognito-identity-js';

import Global = NodeJS.Global;
export interface GlobalWithCognitoFix extends Global {
  fetch: any;
}
declare const global: GlobalWithCognitoFix;
// tslint:disable-next-line: no-var-requires
global.fetch = require('node-fetch');

import {
  UserSignUpPayload,
  SignInResponse,
  SignUpResponse,
  UserSignInPayload,
  UserVerifyCodePayload,
  VerifyCodeResponse,
  RefreshTokenPayload,
  RefreshTokenResult,
  UserResendCodePayload,
  ForgotPasswordPayload,
  ConfirmPasswordPayload,
} from './payloads';

export interface CognitoDefenderCredentials {
  regionCognitoPool: string;
  cognitoUserPoolId: string;
  cognitoClientId: string;
}

export class CognitoDefender {
  private userPool: cognito.CognitoUserPool;
  private pems: any;
  private urlPems: string;

  constructor(credentials: CognitoDefenderCredentials) {
    this.userPool = new cognito.CognitoUserPool({
      UserPoolId: credentials.cognitoUserPoolId,
      ClientId: credentials.cognitoClientId,
    });
  }

}