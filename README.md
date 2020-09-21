![alt text](./images/cognito-defender.png)

[![NPM](https://nodei.co/npm/cognito-defender.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/cognito-defender/)

> Inspired in this post [Amazon Cognito User Pools in NodeJS as fast as possible](https://medium.com/@prasadjay/amazon-cognito-user-pools-in-nodejs-as-fast-as-possible-22d586c5c8ec) thanks Prasad.

# Cognito defender
Cloud based painless wrapper library to handle authentication via AWS Cognito using JWT capabilities, on backend side, cognito defender has a good integration with express and nest.js framework. 

#

## What cover cognito defender

- user signing up
- user sign in
- forgot password
- confirm password
- verify email
- refresh jwt token

## What is not covering cognito defender

1. MFA Setup: because the library used behind the scenes [AWS Cognito](https://www.npmjs.com/package/amazon-cognito-identity-js) really is made to be used on frontend side, then AWS Cognito require some interactions with the user to enable MFA which is not a good fit for API/Backend technologies.
