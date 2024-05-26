var moduleName = "libUE4.so";
var pattern = "04 00 1? 00 ?? 00 00 00";
var module = Process.findModuleByName(moduleName);

// Convert hex to byte string
function convertHexToByteString(hexString) {
    // Remove the '0x' prefix
    let cleanHexString = hexString.startsWith('0x') ? hexString.slice(2) : hexString;

    // Pad with a leading zero if the length is odd
    if (cleanHexString.length % 2 !== 0) {
        cleanHexString = '0' + cleanHexString;
    }

    // Split the string into pairs of two characters
    let byteArray = cleanHexString.match(/.{1,2}/g);

    // Reverse the order of the byte pairs
    byteArray.reverse();

    // Join the byte pairs with spaces
    let byteString = byteArray.join(' ');

    return byteString;
}

function scanMemory(scanStart, scanSize, mempattern, for_what) {
    Memory.scan(scanStart, scanSize, mempattern, {
        onMatch: function (address, size) {
            if (for_what === 'versionString') {
                console.log(`[!] Found: ${address}`);
                if (address) {
                    var addr_to_find = convertHexToByteString(address.toString());
                    scanMemory(module.base.add(0x0), module.size, addr_to_find, "addr_to_find")
                }
            }
            else if (for_what === 'addr_to_find') {
                console.log(`[!] Hooray! ${address}`);
            }
        },
        // onError: function(reason) {
        //     var newstart = ptr(reason.match(/(0x[0-9a-f]+)/)[1]).add(0x4);
        //     var newsize = scanSize - parseInt(newstart.sub(scanStart));
        //     this.error = true;
        //     scanMemory(newstart, newsize, mempattern);
        // },
        onComplete: function() {
            // if (!this.error) {
            //     GNameSearchCompleted = true;
            //     scanMemory(scanStart, scanSize, mempattern);
            // }
            console.log(`[!] Scan done!`);
        }
    })
}

scanMemory(module.base.add(0x0), module.size, pattern, "versionString");
