import 'pinia'

declare module 'pinia' {
    export interface DefineStoreOptionsBase<S, Store> {
        persist?: boolean | {
            storage?: Storage;
            paths?: string[];
            key?: string;
        };
    }
}