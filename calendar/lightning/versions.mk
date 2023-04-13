# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# Lighting version number
THUNDERBIRD_VERSION := $(MOZ_APP_VERSION)
THUNDERBIRD_MAXVERSION := $(MOZ_APP_VERSION)
SEAMONKEY_VERSION := $(MOZ_APP_MAXVERSION)
SEAMONKEY_MAXVERSION := $(MOZ_APP_MAXVERSION)
LIGHTNING_VERSION := $(shell $(PYTHON) $(topsrcdir)/calendar/lightning/build/makeversion.py $(word 1,$(MOZ_PKG_VERSION) $(THUNDERBIRD_VERSION)))
GDATA_VERSION := $(shell $(PYTHON) $(topsrcdir)/calendar/providers/gdata/makeversion.py $(LIGHTNING_VERSION))
