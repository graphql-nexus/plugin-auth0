import { RuntimePlugin } from 'nexus/plugin'

export const plugin: RuntimePlugin = () => project => {
  return {
    context: {
      create: _req => {
        return {
          'nexus-plugin-plugin-auth0': 'hello world!'
        }
      },
      typeGen: {
        fields: {
          'nexus-plugin-plugin-auth0': 'string'
        }
      }
    }
  }
}