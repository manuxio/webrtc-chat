import audioPlay from 'audio-play';
import audioLoad from 'audio-loader';

export default (filename) => {
  return audioLoad(filename).then(audioPlay);
}
