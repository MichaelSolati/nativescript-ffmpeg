import { Callback, Common } from './ffmpeg.common';

export class FFmpeg extends Common {
  static execute(command: string | Array<string>, callback?: Callback, debug: boolean = false): void {
    if (typeof command === 'string') {
      command.replace('ffmpeg ', '');
      command = command.split(' ');
    } else if (Array.isArray(command) && command[0] === 'ffmpeg') {
      command.shift();
    }
    if (callback) { callback('iOS is not supported at this time'); }
  }
}

export class FFprobe extends Common {
  static execute(command: string | Array<string>, callback?: Callback, debug: boolean = false): void {
    if (typeof command === 'string') {
      command.replace('ffprobe ', '');
      command = command.split(' ');
    } else if (Array.isArray(command) && command[0] === 'ffprobe') {
      command.shift();
    }
    if (callback) { callback('iOS is not supported at this time'); }
  }
}
