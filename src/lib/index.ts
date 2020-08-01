import jwt from 'jsonwebtoken'
import { UnauthorizedError } from './errors/UnauthorizedError'
import async from 'async'

export interface Options {
  secret: secretType
  credentialsRequired?: boolean
  requestProperty?: string
  [property: string]: any
}
export type secretType = string | Buffer

export function verify(token: string, options: Options) {
  if (!options || !options.secret) throw new Error('secret should be set')
  if (!options.algorithms) throw new Error('algorithms should be set')
  if (!Array.isArray(options.algorithms))
    throw new Error('algorithms must be an array')

  let credentialsRequired =
    typeof options.credentialsRequired === 'undefined'
      ? true
      : options.credentialsRequired

  if (!token) {
    if (credentialsRequired) {
      return new UnauthorizedError('credentials_required', {
        message: 'No authorization token was found',
      })
    } else {
      let dtoken:
        | string
        | {
            [key: string]: any
          }
        | null

      try {
        dtoken = jwt.decode(token, { complete: true }) || {}
      } catch (err) {
        return new UnauthorizedError('invalid_token', err)
      }

      async.waterfall(
        [
          function getSecret(callback) {
            let arity = secretCallback.length
            if (arity == 4) {
              secretCallback(req, dtoken.header, dtoken.payload, callback)
            } else {
              // arity == 3
              secretCallback(req, dtoken.payload, callback)
            }
          },
          function verifyToken(secret, callback) {
            jwt.verify(token, secret, options, function (err, decoded) {
              if (err) {
                callback(new UnauthorizedError('invalid_token', err))
              } else {
                callback(null, decoded)
              }
            })
          },
          function checkRevoked(decoded, callback) {
            isRevokedCallback(req, dtoken.payload, function (err, revoked) {
              if (err) {
                callback(err)
              } else if (revoked) {
                callback(
                  new UnauthorizedError('revoked_token', {
                    message: 'The token has been revoked.',
                  })
                )
              } else {
                callback(null, decoded)
              }
            })
          },
        ],
        function (err, result) {
          if (err) {
            return err
          }
          return result
        }
      )
      return token
    }
  }
}
