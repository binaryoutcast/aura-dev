/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function run_test() {
  do_check_eq(__LOCATION__.leafName, "test_location.js");
  // also check that __LOCATION__ works via load()
  load("location_load.js");
}
