import { Client as waAutomateClient, ContactId } from '@open-wa/wa-automate';

export default class TrackedUser {
    constructor(phoneNumber: number, name: string) {
        this._phoneNumber = phoneNumber;
        this.__name = name;
    }

    private get _name(): string {
        return this.__name;
    }

    private set _name(value: string) {
        this.__name = value;
    }

    public get name(): string {
        return this._name;
    }

    private get _stateChange(): boolean {
        return this.__stateChange;
    }

    private set _stateChange(value: boolean) {
        this.__stateChange = value;
    }

    public get stateChange(): boolean {
        return this._stateChange;
    }

    private get _isOnline(): boolean {
        return this.__isOnline;
    }

    private set _isOnline(value: boolean) {
        this.__isOnline = value;
    }

    public get isOnline(): boolean {
        return this._isOnline;
    }

    get lastState(): boolean {
        return this._lastState;
    }

    set lastState(value: boolean) {
        this._stateChange = true;
        this._lastState = value;
    }

    get contactId(): ContactId {
        return <ContactId> `${ this._phoneNumber }@c.us`;
    }

    get phoneNumber(): number {
        return this._phoneNumber;
    }

    set phoneNumber(value: number) {
        this._phoneNumber = value;
    }

    private __name: string;
    private _phoneNumber: number;
    private _lastState: boolean = false;
    private __isOnline: boolean = false;
    private __stateChange: boolean = false;

    public static async checkOnline(client: waAutomateClient, trackedUsers: TrackedUser[]): Promise<TrackedUser[]> {
        if (trackedUsers.length < 1) throw new Error("No tracked users");
        let isOnline;
        for (let trackedUSer of trackedUsers) {
            isOnline = await client.isChatOnline(trackedUSer.contactId);
            trackedUSer._isOnline = isOnline;
            trackedUSer._stateChange = false;
            if (isOnline === true) {
                if (trackedUSer.lastState === false) {
                    trackedUSer.lastState = true;
                    trackedUSer._stateChange = true;
                }
            } else if (isOnline === false) {
                if (trackedUSer.lastState === true) {
                    trackedUSer.lastState = false;
                    trackedUSer._stateChange = true;
                }
            }
        }
        return trackedUsers;
    }
}
