import { Common } from './ffmpeg.common';

export class FFmpeg extends Common {
  static execute(command: string | Array<string>, debug?: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof command === 'string') {
        command.replace('ffmpeg ', '');
        command = command.split(' ');
      } else if (Array.isArray(command) && command[0] === 'ffmpeg') {
        command.shift();
      }
      reject('iOS is not supported at this time');
    });
  }
}
