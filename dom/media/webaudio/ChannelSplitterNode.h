/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef ChannelSplitterNode_h_
#define ChannelSplitterNode_h_

#include "AudioNode.h"

namespace mozilla {
namespace dom {

class AudioContext;

class ChannelSplitterNode final : public AudioNode
{
public:
  ChannelSplitterNode(AudioContext* aContext,
                      uint16_t aOutputCount);

  NS_DECL_ISUPPORTS_INHERITED

  JSObject* WrapObject(JSContext* aCx, JS::Handle<JSObject*> aGivenProto) override;

  uint16_t NumberOfOutputs() const override { return mOutputCount; }

  const char* NodeType() const override
  {
    return "ChannelSplitterNode";
  }

  size_t SizeOfIncludingThis(MallocSizeOf aMallocSizeOf) const override
  {
    return aMallocSizeOf(this) + SizeOfExcludingThis(aMallocSizeOf);
  }

protected:
  virtual ~ChannelSplitterNode();

private:
  const uint16_t mOutputCount;
};

} // namespace dom
} // namespace mozilla

#endif

