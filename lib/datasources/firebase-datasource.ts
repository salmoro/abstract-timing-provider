import {AbstractTimingProviderDataSource, TimingSourceRecord} from "../abstract-timing-provider";
import {getDatabase, ref, set, onValue, DatabaseReference} from 'firebase/database';
import {initializeApp} from 'firebase/app';
import {TConnectionState} from "../timing-object.types";

export class FirebaseDatasource implements AbstractTimingProviderDataSource {
    #dbRef: DatabaseReference;

    #networkChangeCallback = (_: TConnectionState) => {};

    constructor(config: {docPath: string;firebase: {apiKey: string; projectId: string;}}) {
        this.#dbRef = ref(getDatabase(initializeApp(config.firebase)), config.docPath) ;
    }

    set = (data: TimingSourceRecord) => set(this.#dbRef, data);

    onData = (cb: (data: TimingSourceRecord) => any) => {
        onValue(this.#dbRef, snapshot => {
            this.#networkChangeCallback('open')
            if (snapshot.exists()) {
                cb(snapshot.val())
            }
        })
    }

    onNetworkChange = (cb: (state: TConnectionState) => any) => {
        this.#networkChangeCallback = cb;
    }
}