class UserModel {
  constructor(options = {}) {
      this.connectionId = '';
      this.audioActive = options.audioActive || false;
      this.videoActive = options.videoActive || false;
      this.screenShareActive = false;
      this.nickname = '';
      this.fullData = {};
      this.streamManager = null;
      this.type = 'local';
      this._isLocal = false;
  }

  isAudioActive() {
      return this.audioActive;
  }

  isVideoActive() {
      return this.videoActive;
  }

  isScreenShareActive() {
      return this.screenShareActive;
  }

  getConnectionId() {
      return this.connectionId;
  }

  getNickname() {
      return this.nickname;
  }

  getStreamManager() {
      return this.streamManager;
  }

  isLocal() {
      return this._isLocal;
  }
  isDesktop() {
    return this.type === 'desktop';
  }
  isRemote() {
      return !this.isLocal();
  }
  setAudioActive(isAudioActive) {
      this.audioActive = isAudioActive;
  }
  setVideoActive(isVideoActive) {
      this.videoActive = isVideoActive;
  }
  setScreenShareActive(isScreenShareActive) {
      this.screenShareActive = isScreenShareActive;
  }
  setStreamManager(streamManager) {
      this.streamManager = streamManager;
  }

  setConnectionId(conecctionId) {
      this.connectionId = conecctionId;
  }
  setNickname(nickname) {
      this.nickname = nickname;
  }

  canBePlayed() {
    return !!this.streamManager;
  }

  setLocal(local) {
    this._isLocal = local;
  }

  setFullData(data) {
    this.fullData = data;
    if (typeof data.audioActive !== 'undefined') {
      this.setAudioActive(data.audioActive);
      this.setVideoActive(data.videoActive);
      this.setNickname(data.nickname);
      this.setScreenShareActive(data.screenShareActive);
    }
  }

  getFullData() {
    return Object.assign({}, this.fullData, {
      videoActive: this.videoActive,
      audioActive: this.audioActive,
      nickname: this.nickname,
      screenShareActive: this.screenShareActive
    });
  }

  setType(type) {
    if (type === 'local' | type === 'remote' | type === 'desktop') {
        this.type = type;
    }
  }
}

export default UserModel;
