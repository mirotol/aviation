import { TextEncoder, TextDecoder } from 'util';

/**
 * JSDOM (the environment Jest uses to simulate a browser) does not include the Encoding API
 * (TextEncoder/TextDecoder) by default. Since @stomp/stompjs relies on these for binary
 * message parsing, we polyfill them here using Node's native 'util' module to prevent
 * ReferenceErrors during tests.
 */
Object.assign(global, { TextEncoder, TextDecoder });
