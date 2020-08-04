import { plugin } from '@nexus/schema'

export function Auth0Plugin(protectedPaths: string[]) {
  return plugin({
    name: 'Auth0 Plguin',
    description: 'A nexus schema plugin for Auth0',

    onCreateFieldResolver(config) {
      return async (root, args, ctx, info, next) => {
        const parentType = config.parentTypeConfig.name

        console.log(ctx.token)
        if (parentType != 'Query' && parentType != 'Mutation') {
          return await next(root, args, ctx, info)
        }

        const resolver = `${parentType}.${config.fieldConfig.name}`

        if (!protectedPaths.includes(resolver)) {
          return await next(root, args, ctx, info)
        }
        if (!ctx.token) {
          throw new Error('Not Authorized!')
        }

        return await next(root, args, ctx, info)
      }
    },
  })
}
