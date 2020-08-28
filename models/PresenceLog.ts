export default class PresenceLog {
    get end(): number {
        return this._end;
    }

    set end(value: number) {
        this._end = value;
    }

    get start(): number {
        return this._start;
    }

    set start(value: number) {
        this._start = value;
    }

    private _start: number;
    private _end: number;

    public getDuration() {
        return this._end - this._start;
    }
}
