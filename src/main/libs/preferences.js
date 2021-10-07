import {app} from 'electron';
import path from 'path';
import os from 'os';
import ElectronPreferences from 'electron-preferences';
const preferences = new ElectronPreferences({
  'dataStore': path.resolve(app.getPath('userData'), 'preferences.json'),
  'defaults': {
    'notes': {
      'folder': path.resolve(os.homedir(), 'Notes')
    },
    'markdown': {
      'auto_format_links': true,
      'show_gutter': false
    },
    'preview': {
      'show': true
    },
    'drawer': {
      'show': true
    }
  }
});

export default preferences;