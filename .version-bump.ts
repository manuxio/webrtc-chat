// This is an optional configuration file
// you can use with version-bump.
// If specified, any command line args has priority over the
// values returned in this file.

// All values are optional.
// Do not use the ES6 export default
// since the file is imported using require()
// See command line options for additional available properties
module.exports = {
  // (required) Name of the strategy as found in the strategy list in the CLI
  strategy: 'cli',

  // (optional) Root of the project where the version file is found
  // default is process.cwd()
  projectRoot: () => {
    return process.cwd()
  },

  /**
   * (optional)
   * This is called after the version has been incremented
   * and before the version data is to be converted to a string and saved
   * to the version file
   * Use the opportunity to do any custom-work to the version data
   * eg add a pre-release string, or build string
   * @param {object} versionData
   * @param {number} versionData.major
   * @param {number} versionData.minor
   * @param {number} versionData.patch
   * @param {array|undefined} versionData.pre Ex: ['alpha', 1] becomes x.x.x-alpha.1
   * @param {array|undefined} versionData.build Ex: ['qa', 1234] becomes x.x.x+qa.1234
   * @returns {object}
   */
  // onBeforeRelease: (versionData) => {
  //   versionData.pre = ['alpha', 1]
  //   return versionData
  // },

  // (optional) Version file starting from projectRoot
  // default is package.json
  versionFile: './build/app/package.json',

  // Options specific to the strategy you are using
  // root properties can be set to straight values, or (async) functions that return a value
  // this corresponds to the --bump option
  bump: () => {
    return 'patch'
  }
}
