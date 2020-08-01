import { RuntimePlugin } from 'nexus/plugin'
import { verify, decode } from 'jsonwebtoken'
import { Settings } from './settings'
import { Auth0Plugin } from './lib/schema'
import jwksClient, { SigningKey, CertSigningKey } from 'jwks-rsa'

export const plugin: RuntimePlugin<Settings, 'required'> = (
  settings: Settings
) => (project: any) => {
  var plugins = []
  const protectedPaths = settings.protectedPaths
  if (protectedPaths) {
    plugins.push(Auth0Plugin(protectedPaths))
  }

  return {
    context: {
      create: async (req: any) => {
        if (
          req.headers.authorization &&
          req.headers.authorization.split(' ')[0] === 'Bearer'
        ) {
          const token = req.headers.authorization.split(' ')[1]
          return verifyToken(
            token,
            settings.auth0Domain,
            settings.auth0Audience
          )
        }

        return {
          token: null,
        }
      },
      typeGen: {
        fields: {
          token: 'string | null',
        },
      },
    },
    schema: {
      plugins,
    },
  }
}

/**
 * Verify a token
 *
 * @param token
 * @param auth0Domain
 * @param auth0Audience
 *
 */
const verifyToken = async (
  token: string,
  auth0Domain: string,
  auth0Audience: string
) => {
  try {
    const client = jwksClient({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
    })
    const secret = await getSecret(client, token)
    // TODO Remove
    console.log(`Secret: ${secret} `)

    if (secret) {
      const verifiedToken = verify(token, secret, { audience: auth0Audience })
      return {
        token: verifiedToken,
      }
    } else {
      return {
        token: null,
      }
    }
  } catch (err) {
    return {
      token: null,
    }
  }
}

function getSecret(
  client: jwksClient.JwksClient,
  token: string
): Promise<string | null> {
  return new Promise(function (resolve, reject) {
    const decodedToken = decode(token)
    const header =
      decodedToken && typeof decodedToken === 'object' && decodedToken['header']
    console.log(decodedToken)
    if (!header || header.alg !== 'RS256') {
      reject(new Error('No Header or Incorrect Header Alg, Only RS256 Allowed'))
    }
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        return reject(err)
      }
      //@ts-ignore
      return resolve(key.publicKey || key.rsaPublicKey)
    })
  })
}
