/// <reference types="w3c-web-hid" />
/// <reference types="node" />
import Transport from "@ledgerhq/hw-transport";
import type { Observer, DescriptorEvent, Subscription } from "@ledgerhq/hw-transport";
import type { DeviceModel } from "@ledgerhq/devices";
declare function getLedgerDevices(): Promise<HIDDevice[]>;
/**
 * WebHID Transport implementation
 * @example
 * import TransportWebHID from "@ledgerhq/hw-transport-webhid";
 * ...
 * TransportWebHID.create().then(transport => ...)
 */
export default class TransportWebHID extends Transport {
    device: HIDDevice;
    deviceModel: DeviceModel | null | undefined;
    channel: number;
    packetSize: number;
    constructor(device: HIDDevice);
    inputs: Buffer[];
    inputCallback: ((arg0: Buffer) => void) | null | undefined;
    read: () => Promise<Buffer>;
    onInputReport: (e: HIDInputReportEvent) => void;
    /**
     * Check if WebUSB transport is supported.
     */
    static isSupported: () => Promise<boolean>;
    /**
     * List the WebUSB devices that was previously authorized by the user.
     */
    static list: typeof getLedgerDevices;
    /**
     * Actively listen to WebUSB devices and emit ONE device
     * that was either accepted before, if not it will trigger the native permission UI.
     *
     * Important: it must be called in the context of a UI click!
     */
    static listen: (observer: Observer<DescriptorEvent<HIDDevice>>) => Subscription;
    /**
     * Similar to create() except it will always display the device permission (even if some devices are already accepted).
     */
    static request(): Promise<TransportWebHID>;
    /**
     * Similar to create() except it will never display the device permission (it returns a Promise<?Transport>, null if it fails to find a device).
     */
    static openConnected(): Promise<TransportWebHID | null>;
    /**
     * Create a Ledger transport with a HIDDevice
     */
    static open(device: HIDDevice): Promise<TransportWebHID>;
    _disconnectEmitted: boolean;
    _emitDisconnect: (e: Error) => void;
    /**
     * Release the transport device
     */
    close(): Promise<void>;
    /**
     * Exchange with the device using APDU protocol.
     * @param apdu
     * @returns a promise of apdu response
     */
    exchange: (apdu: Buffer) => Promise<Buffer>;
    setScrambleKey(): void;
}
export {};
//# sourceMappingURL=TransportWebHID.d.ts.map