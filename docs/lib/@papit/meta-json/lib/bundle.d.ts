/** Any binary input the codec accepts. */
declare type BufferSource_2 = ArrayBuffer | ArrayBufferView;
export { BufferSource_2 as BufferSource }

/**
 * Static encoder/decoder for the meta-json binary layout:
 * `[uint32 BE meta length][meta JSON, UTF-8][payload bytes]`.
 */
export declare class Codec {
    private static encoder;
    private static decoder;
    /** Decodes UTF-8 bytes and `JSON.parse`s them. A view reads only its own `byteOffset`/`byteLength` range. */
    static Parse<Payload>(payload: BufferSource_2): Payload;
    private static Bytes;
    /**
     * Packs a message into one buffer. A binary payload (`ArrayBuffer` or any view) is copied
     * as its bytes, a string as UTF-8; anything else goes through `String()`, so stringify objects first.
     */
    static Encode<Meta extends Object = object, Payload = string>(message: MessageType<Meta, Payload>): Uint8Array;
    /**
     * Unpacks a buffer made by `Encode`. The payload is a zero-copy `Uint8Array` view
     * unless `parsePayload` is true, then it is `JSON.parse`d.
     * @throws RangeError when the buffer is shorter than the 4-byte header, or the header's meta length runs past its end
     * @throws SyntaxError when the meta (or a parsed payload) is not valid JSON
     */
    static Decode<Meta extends Object = object, Payload = any>(data: Uint8Array, parsePayload?: boolean): MessageType<Meta, Payload | BufferSource_2>;
}

/** A message as two parts: JSON metadata and a payload. */
export declare type MessageType<Meta = Object, Payload = Object> = {
    meta: Meta;
    payload: Payload;
};

/**
 * A message with JSON metadata and a lazily parsed payload.
 * Decode with `FromBinary` to read `meta` without touching the payload; call `parse()` only when needed.
 */
export declare class MetaJson<Meta extends Object = object, Payload = any> implements MessageType<Meta, Payload | BufferSource_2> {
    meta: Meta;
    payload: Payload | BufferSource_2;
    private parsed;
    private binary;
    constructor(meta: Meta, payload: Payload | BufferSource_2);
    /** Encodes via `Codec.Encode`. The result is cached; pass `force` to re-encode after changing `meta` or `payload`. */
    toBinary(force?: boolean): Uint8Array<ArrayBufferLike>;
    /** `JSON.parse`s a binary payload once and caches it. Non-binary payloads are returned as they are. */
    parse<T extends Payload = Payload>(): T;
    /** Same as `new this(meta, payload)`, typed to return the subclass it is called on. */
    static Create<This extends new (meta: any, payload: any) => MetaJson<any, any>, Meta extends Object = object, Payload = Object | string>(this: This, meta: Meta, payload: Payload): InstanceType<This>;
    /** Decodes a buffer from `toBinary` / `Codec.Encode`. Returns the subclass it is called on. */
    static FromBinary<This extends new (meta: any, payload: any) => MetaJson<any, any>, Meta extends Object = object, Payload = any>(this: This, data: Uint8Array<ArrayBufferLike>, parsePayload?: boolean): InstanceType<This>;
}

export { }
