import { Observable } from 'tns-core-modules/data/observable';

export type Callback = (error?: string) => void;

export class Common extends Observable {
  constructor() {
    super();
  }
}