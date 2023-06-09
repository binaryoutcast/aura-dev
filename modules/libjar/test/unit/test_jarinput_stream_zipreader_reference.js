/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function wrapInputStream(input)
{
  var nsIScriptableInputStream = Components.interfaces.nsIScriptableInputStream;
  var factory = Components.classes["@mozilla.org/scriptableinputstream;1"];
  var wrapper = factory.createInstance(nsIScriptableInputStream);
  wrapper.init(input);
  return wrapper;
}

// Check that files can be read from after closing zipreader
function run_test() {
  const Cc = Components.classes;
  const Ci = Components.interfaces;

  // the build script have created the zip we can test on in the current dir.
  var file = do_get_file("data/test_bug333423.zip");

  var zipreader = Cc["@mozilla.org/libjar/zip-reader;1"].
                  createInstance(Ci.nsIZipReader);
  zipreader.open(file);
  // do crc stuff
  function check_archive_crc() {
    zipreader.test(null);
    return true;
  }
  do_check_true(check_archive_crc())
  var entries = zipreader.findEntries(null);
  var stream = wrapInputStream(zipreader.getInputStream("modules/libjar/test/Makefile.in"))
  var dirstream= wrapInputStream(zipreader.getInputStream("modules/libjar/test/"))
  zipreader.close();
  zipreader = null;
  Components.utils.forceGC();
  do_check_true(stream.read(1024).length > 0);
  do_check_true(dirstream.read(100).length > 0);
}

