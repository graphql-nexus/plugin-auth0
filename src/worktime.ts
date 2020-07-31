import { WorktimePlugin } from 'nexus/plugin'

export const plugin: WorktimePlugin = () => project => {
  project.hooks.dev.onStart = async () => {
    project.log.info('dev.onStart hook from plugin-auth0')
  }
  project.hooks.dev.onBeforeWatcherRestart = async () => {
    project.log.info('dev.onBeforeWatcherRestart hook from plugin-auth0')
  }
  project.hooks.dev.onAfterWatcherRestart = async () => {
    project.log.info('dev.onAfterWatcherRestart hook from plugin-auth0')
  }
  project.hooks.dev.onBeforeWatcherStartOrRestart = async () => {
    project.log.info('dev.onBeforeWatcherStartOrRestart hook from plugin-auth0')
  }
  project.hooks.build.onStart = async () => {
    project.log.info('build.onStart hook from plugin-auth0')
  }
}