import { Common } from './ffmpeg.common';
export declare class FFmpeg extends Common {
  static execute(command: string | Array<string>): Promise<void>;
}
