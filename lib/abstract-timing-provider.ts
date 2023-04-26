import {TConnectionState, TimingObjectEvent, TimingProvider, TimingStateVector} from "./timing-object.types";

export interface TimingSourceRecord extends Omit<TimingStateVector, 'timestamp'> {
    clientId: string;
    time: number,
}

export interface AbstractTimingProviderDataSource {
    set: (record: TimingSourceRecord) => Promise<void>;
    onData: (handler: (record: TimingSourceRecord) => void) => void;
    onNetworkChange: (handler: (status: TConnectionState) => void) => void;
}

export class AbstractTimingProvider extends EventTarget implements TimingProvider {
    vector: TimingStateVector = {position: 0, acceleration: 0, timestamp: 0, velocity: 0}

    onadjust;
    onchange;
    onreadystatechange;
    startPosition;
    endPosition;
    error;
    readyState = 'connecting' as TConnectionState;
    skew = 0;

    // A unique client id created for each session
    #clientId = crypto.randomUUID();

    constructor(private dataProvider: AbstractTimingProviderDataSource
    ) {
        super();
        this.#listenStatusChange();
        this.#listenSource();
    }

    async update(vector: Partial<TimingStateVector>, updateSource = true): Promise<void> {
        let {position, timestamp, velocity, acceleration} = this.vector;
        position = position + (((performance.now() / 1000) - timestamp) * velocity);

        this.vector = {
            acceleration,
            velocity,
            position,
            ...vector,
            timestamp: performance.now() / 1000,
        };

        this.#dispatchEvent('change')

        if (updateSource) {
            const {timestamp, ...vec} = this.vector;
            await this.#updateSource(vec)
        }
    }

    #listenStatusChange() {
        this.dataProvider.onNetworkChange(status => {
            if (this.readyState !== status) {
                this.readyState = status;
                this.#dispatchEvent('readystatechange');
            }
        })
    }

    #listenSource() {
        this.dataProvider.onData(value => {

            const {time, clientId, ...vector} = value;

            if (clientId !== this.#clientId) {
                this.update({
                    ...vector,
                    position: vector.position + (vector.velocity * ((Date.now() - time) / 1000)),
                }, false)
            }
        })
    }

    #updateSource(vector: Omit<TimingStateVector, 'timestamp'>) {
        this.dataProvider.set({
            ...vector,
            clientId: this.#clientId,
            time: Date.now(),
        });
    }

    #dispatchEvent(eventName: TimingObjectEvent | 'skew') {
        this.dispatchEvent(new Event(eventName));

        // dispatch to registered event handlers (e.g. onchange, onerror)
        const registeredHandler = `on${eventName}` as const;
        if (typeof this[registeredHandler] === 'function') {
            this[registeredHandler]();
        }
    }
}