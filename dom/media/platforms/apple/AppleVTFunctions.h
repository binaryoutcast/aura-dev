/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Construct references to each of the VideoToolbox symbols we use.

LINK_FUNC(VTDecompressionSessionCreate)
LINK_FUNC(VTDecompressionSessionDecodeFrame)
LINK_FUNC(VTDecompressionSessionInvalidate)
LINK_FUNC(VTDecompressionSessionWaitForAsynchronousFrames)
LINK_FUNC(VTSessionCopyProperty)
LINK_FUNC(VTSessionCopySupportedPropertyDictionary)
