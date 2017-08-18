/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const HKDF = require('node-hkdf');
const base64url = require('base64url');
const strftime = require('strftime')

const KEY_CLASS_TAG_B = 'kS';
const KEY_LENGTH = 32;

class ScopedKeys {
  /**
   *
   * @param kB - Hex String
   * @param scopedKeySalt - Hex String
   * @param scopedKeyIdentifier - Hex String
   * @returns {Promise} Resolves into key - Hex String
   */
  deriveScopedKeys(options) {
    if (! options.inputKey) {
      throw new Error('inputKey required');
    }

    if (! options.scopedKeySalt) {
      throw new Error('scopedKeySalt required');
    }

    if (! options.scopedKeyTimestamp) {
      throw new Error('scopedKeyTimestamp required');
    }

    const scopedKeySaltBuf = new Buffer(options.scopedKeySalt, 'hex');
    const inputKeyBuf = new Buffer(options.inputKey, 'hex');

    return new Promise((resolve) => {
      const hkdf = new HKDF('sha256', scopedKeySaltBuf, inputKeyBuf);
      const context = 'identity.mozilla.com/picl/v1/scoped_key\n' +
        options.scopedKeyIdentifier;
      const contextKid = 'identity.mozilla.com/picl/v1/scoped_kid\n' +
        options.scopedKeyIdentifier;

      const contextBuf = new Buffer(context);

      hkdf.derive(contextBuf, KEY_LENGTH, (key) => {
        const timestamp = strftime('%Y%m%d%H%M%S', new Date(options.scopedKeyTimestamp));
        const scopedKey = {
          // strftime(scoped_key_timestamp, "YYYYMMDDHHMMSS")
          // "20170101123902"
          // kid: timestamp + '-' + this.deriveKid({
          //   // TODO: same call as here, but context is different
          //   // contextKid
          // }),
          kid: timestamp + '-TODO',
          k: base64url(key),
          kty: 'oct',
          scope: options.scopedKeyIdentifier,
        };
        // TODO: check if we can load this with webcrypto.
        resolve({
          [options.scopedKeyIdentifier]: scopedKey
        });
      });

    });

  }

  deriveKid(options) {

  }
}

module.exports = ScopedKeys;
