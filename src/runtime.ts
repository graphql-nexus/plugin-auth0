import { RuntimePlugin, RuntimeLens } from 'nexus/plugin'
import { verify, decode } from 'jsonwebtoken'
import { Settings } from './settings'
import { Auth0Plugin } from './schema'
import jwksClient from 'jwks-rsa'

export type DecodedAccessToken = {
  iss: string,
  sub: string,
  aud: string[],
  iat: number,
  exp: number,
  azp: string,
  scope: string
}

export const plugin: RuntimePlugin<Settings, 'required'> = (settings: Settings) => (project) => {
  var plugins = []
  const protectedPaths = settings.protectedPaths
  if (protectedPaths) {
    plugins.push(Auth0Plugin(protectedPaths))
  }

  return {
    context: {
      create: async (req: any) => {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
          const token = req.headers.authorization.split(' ')[1]
          return await verifyToken(project, token, settings)
        }
        return {
          token: null,
        }
      },

      typeGen: {
        fields: {
          token: `{
            iss: string,
            sub: string,
            aud: string[],
            iat: number,
            exp: number,
            azp: string,
            scope: string
          } | null`,
        }
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
  project: RuntimeLens,
  token: string,
  settings: Settings
): Promise<{ token: DecodedAccessToken | null }> => {
  try {
    const client = jwksClient({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      strictSsl: true,
      jwksUri: `https://${settings.auth0Domain}/.well-known/jwks.json`,
    })
    const secret = await getSecret(client, token)

    if (secret) {
      const decodedToken = verify(token, secret, { audience: settings.auth0Audience })
      settings.debug && project.log.info(JSON.stringify(decodedToken))
      return { token: decodedToken as DecodedAccessToken }
    } else {
      return { token: null }
    }
  } catch (err) {
    project.log.error(err)
    throw err
  }
}

function getSecret(client: jwksClient.JwksClient, token: string): Promise<string | null> {
  return new Promise(function (resolve, reject) {
    const decodedToken = decode(token, { complete: true })
    const header = decodedToken && typeof decodedToken === 'object' && decodedToken['header']
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
