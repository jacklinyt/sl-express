require(process.cwd() + '/test/bootstrap.js')
const PluginService = require(`${libPath}/services/PluginService.js`)

class TestSuite extends TestCombo {
  get title() {
    return 'app.loadPlugins'
  }

  get args() {
    return ['plugins']
  }

  get argTypes() {
    return {
      plugins: [
        'hasErrorInApplication',
        'successInApplication',
        'hasErrorInSLExpress',
        'successInSLExpress',
        'notFound'
      ]
    }
  }

  filter(combination) {
    return true
  }

  extraCombinations() {
    return []
  }

  beforeAll(test, combination) {}

  beforeEach(test, combination) {
    return this.runTest(test, combination)
  }

  afterAll(test, combination) {}

  afterEach(test, combination) {
    jest.restoreAllMocks()
  }

  getArgValues(test, combination, arg, argType) {
    const argValues = {
      plugins: {
        hasErrorInApplication: 'error',
        successInApplication: 'sample',
        hasErrorInSLExpress: 'errorInLib',
        successInSLExpress: 'mongoose',
        notFound: 'notFound'
      }
    }
    return argValues[arg][argType]
  }

  testMethod(test, combination, argValues) {
    const [plugins] = argValues
    const pluginService = new PluginService({
      dirs: [
        `${libPath}/plugins`,
        `${process.cwd()}/test/exampleApp/api/plugins`
      ]
    })

    test.pluginService = pluginService
    return test.pluginService.add(plugins)
  }

  shouldSuccess(combination) {
    const [plugin] = combination
    return plugin.match(/success/)
  }

  successAssert(test, combination) {
    const [plugins] = combination
    it('Loading the plugin success in sl-express', () => {
      expect(test.pluginService.importedPluginKeys.length).toBe(1)
    })
  }

  failureAssert(test, combination) {
    const [plugins] = combination
    if(plugins === 'notFound'){
      it('should throw error', () => {
        expect(test.res.constructor.name).toEqual('PluginNotFoundError')
      })
    }else{
      it('should throw error', () => {
        expect(test.res.constructor.name).toEqual('PluginLoadError')
      })
    }
      
  }
}

const testSuite = new TestSuite()
testSuite.run()
