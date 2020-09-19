import * as cognito from 'amazon-cognito-identity-js';
import Axios from  'axios-observable';
import * as jwkToPem from 'jwk-to-pem';
import * as jwt from 'jsonwebtoken';

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
  PayloadJWTDecoded,
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

    this.urlPems = `https://cognito-idp.${credentials.regionCognitoPool}.amazonaws.com/${credentials.cognitoUserPoolId}/.well-known/jwks.json`;

    // Start to initialize pems
    try {
      Axios.get(this.urlPems).subscribe((keyPems: any) => {
        this.initPems(keyPems.data);
      });
    } catch (e) {
      throw new Error('Error initializing pems' + e.message);
    }
  }

  private initPems(keyPems: any) {
    const bufferPems: any = {};
    for (const key of keyPems.keys) {
      // Convert each key to PEM
      const keyId = key.kid;
      const modulus = key.n;
      const exponent = key.e;
      const keyType = key.kty;
      const jwk = { kty: keyType, n: modulus, e: exponent };
      const pem = jwkToPem(jwk);
      bufferPems[keyId] = pem;
    }
    this.pems = bufferPems;
  }

  public async verifyAccessToken(accessToken: string): Promise<string | PayloadJWTDecoded | undefined> {
    // validate the token
    const decodedJwt: any = jwt.decode(accessToken, { complete: true });

    const invalidMessage = 'invalid token';
    if (!decodedJwt) {
      return Promise.reject(invalidMessage);
    }

    const pem = this.pems[decodedJwt.header.kid];

    if (!pem) {
      return Promise.reject(invalidMessage);
    }

    let payload: PayloadJWTDecoded;
    try {
      payload = jwt.verify(accessToken, pem);
    } catch (error) {
      return Promise.reject('token expire');
    }

    payload = {
      uuid: payload['custom:uuid'],
      email: payload.email,
      emailVerified: payload['email_verified'],
      cognitoId: payload['cognito:username'],
      role: payload['custom:role'],
      username: payload['nickname'],
      eventId: payload['event_id'],
    };

    return payload;
  }

  public async signUp(
    payload: UserSignUpPayload,
    uuid = '',
  ): Promise<SignUpResponse> {
    const attributeList = [
      new cognito.CognitoUserAttribute({
        Name: 'nickname',
        Value: payload.username,
      }),
      new cognito.CognitoUserAttribute({
        Name: 'custom:role',
        Value: payload.role,
      }),
      new cognito.CognitoUserAttribute({
        Name: 'custom:uuid',
        Value: uuid,
      }),
    ];

    return new Promise((resolve, reject) => {
      this.userPool.signUp(
        payload.email,
        payload.password,
        attributeList,
        [],
        (err: any, data: any) => {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'The confirmation code was sent to email',
          });
        },
      );
    });
  }

  public async login(payload: UserSignInPayload): Promise<SignInResponse> {
    const authenticationDetails = new cognito.AuthenticationDetails({
      Username: payload.email,
      Password: payload.password,
    });

    const userData = {
      Username: payload.email,
      Pool: this.userPool,
    };

    const cognitoUser = new cognito.CognitoUser(userData);
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result: any) => {
          const authData = {
            token: result.getIdToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
            mfa: null,
          };
          return resolve(authData);
        },
        onFailure: (err: any) => {
          return reject(err);
        },
      });
    });
  }

  public async verifyCode(
    payload: UserVerifyCodePayload,
  ): Promise<VerifyCodeResponse> {
    const userData = {
      Username: payload.email,
      Pool: this.userPool,
    };

    return new Promise((resolve, reject) => {
      const cognitoUser = new cognito.CognitoUser(userData);
      cognitoUser.confirmRegistration(
        payload.code,
        true,
        (err: any, data: any) => {
          if (err) {
            return reject(err);
          }
          return resolve({ message: 'Success' });
        },
      );
    });
  }

  public async refreshToken(
    payload: RefreshTokenPayload,
  ): Promise<RefreshTokenResult> {
    const RefreshToken = new cognito.CognitoRefreshToken({
      RefreshToken: payload.refreshToken,
    });

    const userData = {
      Username: payload.email,
      Pool: this.userPool,
    };

    const cognitoUser = new cognito.CognitoUser(userData);

    return new Promise((resolve, reject) => {
      cognitoUser.refreshSession(RefreshToken, (err: any, session: any) => {
        if (err) {
          return reject(err);
        }
        const refreshObj = {
          token: session.idToken.jwtToken,
        };
        return resolve(refreshObj);
      });
    });
  }

  public async resendConfirmation(payload: UserResendCodePayload) {
    const userData = {
      Username: payload.email,
      Pool: this.userPool,
    };

    const cognitoUser = new cognito.CognitoUser(userData);

    return new Promise((resolve, reject) => {
      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          return reject(err.message);
        }
        return resolve(result);
      });
    });
  }

  public async forgotPassword(
    forgotPayload: ForgotPasswordPayload,
  ): Promise<any> {
    const userData = {
      Username: forgotPayload.email,
      Pool: this.userPool,
    };

    const cognitoUser = new cognito.CognitoUser(userData);
    return new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: function(data) {
          return resolve(data);
        },
        onFailure: function(err) {
          return reject(err.message || JSON.stringify(err));
        },
      });
    });
  }

  public async confirmPassword(
    confirmPayload: ConfirmPasswordPayload,
  ): Promise<any> {
    const userData = {
      Username: confirmPayload.email,
      Pool: this.userPool,
    };

    const cognitoUser = new cognito.CognitoUser(userData);
    return new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(
        confirmPayload.code,
        confirmPayload.password,
        {
          onSuccess() {
            return resolve('Password confirmed!');
          },
          onFailure(err) {
            return reject(err.message);
          },
        },
      );
    });
  }
}