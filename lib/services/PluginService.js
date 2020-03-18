class PluginLoadError extends Error {}
class PluginNotFoundError extends Error {}
class PluginService {
  constructor({
    dirs = [],
  } = {}) {
    this.dirs = dirs
    this.importedPluginKeys = []
    this.importedPluginMap = {}
  }

  add(key) {
    let loadingPluginError = null
    let pluginNotFoundError = null
    const plugin = this.dirs.reduce((acc, dir) => {
      if (acc) return acc

      let plugin = null

      try {
        plugin = require(`${dir}/${key}`)
      }catch (e) {
        if (e.message.includes('PluginService')) {
          pluginNotFoundError = e
          throw new PluginLoadError(`Plugin not found.\n ${e}`)
        } else {
          loadingPluginError = e
          throw new PluginLoadError(`Plugin Loading error.\n ${e}`)
        }
      }finally {
        return plugin
      }
    }, null)

    if (!plugin) {
      if (loadingPluginError != null)
        throw new PluginLoadError(
          `Plugin Loading error.\n ${loadingPluginError}`
        )
      else
        throw new PluginNotFoundError(
          `Plugin not found.\n ${pluginNotFoundError}`
        )
    }

    this.importedPluginKeys = [
      ...this.importedPluginKeys,
      key,
    ]

    this.importedPluginMap = {
      ...this.importedPluginMap,
      [key]: plugin,
    }
  }

  async executePluginPhase({ phase, reversed = false, context }) {
    const {
      importedPluginKeys,
      importedPluginMap,
    } = this

    const plugins = reversed ? importedPluginKeys.slice().reverse() : importedPluginKeys

    return Promise.each( plugins, async (key) => {
      const plugin = importedPluginMap[key]

      if (!plugin) {
        throw new Error('plugin not exist')
      }

      if (typeof plugin[phase] !== 'function') return plugin

      await plugin[phase](context)
    })
  }
}

module.exports = PluginService
