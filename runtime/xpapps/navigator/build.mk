# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

installer:
	@$(MAKE) -C runtime/xpapps/navigator/installer installer

package:
	@$(MAKE) -C runtime/xpapps/navigator/installer make-archive

mozpackage:
	@$(MAKE) -C runtime/xpapps/navigator/installer make-package

stage-package:
	@$(MAKE) -C runtime/xpapps/navigator/installer stage-package make-buildinfo-file

install::
	@$(MAKE) -C runtime/xpapps/navigator/installer install
