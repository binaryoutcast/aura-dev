/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
#ifndef MP3Decoder_h_
#define MP3Decoder_h_

#include "MediaDecoder.h"

namespace mozilla {

class MP3Decoder : public MediaDecoder {
public:
  // MediaDecoder interface.
  explicit MP3Decoder(MediaDecoderOwner* aOwner) : MediaDecoder(aOwner) {}
  MediaDecoder* Clone(MediaDecoderOwner* aOwner) override;
  MediaDecoderStateMachine* CreateStateMachine() override;

  // Returns true if the MP3 backend is preffed on, and we're running on a
  // platform that is likely to have decoders for the format.
  static bool IsEnabled();
  static bool CanHandleMediaType(const nsACString& aType,
                                 const nsAString& aCodecs);
};

} // namespace mozilla

#endif
