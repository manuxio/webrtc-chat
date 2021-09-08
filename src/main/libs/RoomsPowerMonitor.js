import { powerMonitor } from 'electron';
import EventEmitter from 'events';
const IDLETIMEOUT = 120;

class RoomsPowerMonitor extends EventEmitter {
  constructor(appState) {
    super(appState);
    this.appState = appState;
    appState.systemIdleTime = powerMonitor.getSystemIdleTime();
    appState.isOnBatteryPower = powerMonitor.isOnBatteryPower();
    const passThruEvents = ['suspend', 'resume', 'on-ac', 'on-battery', 'lock-screen', 'unlock-screen'];
    passThruEvents.map((evName) => {
      powerMonitor.on(evName, (e) => {
        this.emit(evName, e);
      });
    });
    if (appState.isOnBatteryPower) {
      this.emit('on-battery', null);
    }
    powerMonitor.on('on-battery', () => {
      appState.isOnBatteryPower = true;
    });
    powerMonitor.on('on-ac', () => {
      appState.isOnBatteryPower = false;
    });
    this.timer = setTimeout(() => {
      this.checkIdleState()
    }, 5000);
  }

  checkIdleState() {
    const state = powerMonitor.getSystemIdleState(IDLETIMEOUT);
    if (this.appState.idleState !== state) {
      this.appState.idleState = state;
      this.emit('idle-state-change');
    }
    this.timer = setTimeout(() => {
      this.checkIdleState()
    }, 1000);
  }
}


export default RoomsPowerMonitor;
