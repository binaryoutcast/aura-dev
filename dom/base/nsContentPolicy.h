/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef __nsContentPolicy_h__
#define __nsContentPolicy_h__

#include "nsIContentPolicy.h"
#include "nsISimpleContentPolicy.h"
#include "nsCategoryCache.h"

/* 
 * Implementation of the "@mozilla.org/layout/content-policy;1" contract.
 */

class nsContentPolicy : public nsIContentPolicy
{
 public:
    NS_DECL_ISUPPORTS
    NS_DECL_NSICONTENTPOLICY

    nsContentPolicy();

 protected:
    virtual ~nsContentPolicy();

 private:
    //Array of policies
    nsCategoryCache<nsIContentPolicy> mPolicies;
    nsCategoryCache<nsISimpleContentPolicy> mSimplePolicies;

    //Helper type for CheckPolicy
    typedef
    NS_STDCALL_FUNCPROTO(nsresult, CPMethod, nsIContentPolicy,
                         ShouldProcess,
                         (uint32_t, nsIURI*, nsIURI*, nsISupports*,
                           const nsACString &, nsISupports*, nsIPrincipal*,
                           int16_t*));

    typedef
    NS_STDCALL_FUNCPROTO(nsresult, SCPMethod, nsISimpleContentPolicy,
                         ShouldProcess,
                         (uint32_t, nsIURI*, nsIURI*, nsIDOMElement*, bool,
                           const nsACString &, nsISupports*, nsIPrincipal*,
                           int16_t*));

    //Helper method that applies policyMethod across all policies in mPolicies
    // with the given parameters
    nsresult CheckPolicy(CPMethod policyMethod, SCPMethod simplePolicyMethod,
                         nsContentPolicyType contentType,
                         nsIURI *aURI, nsIURI *origURI,
                         nsISupports *requestingContext,
                         const nsACString &mimeGuess, nsISupports *extra,
                         nsIPrincipal *requestPrincipal,
                         int16_t *decision);
};

nsresult
NS_NewContentPolicy(nsIContentPolicy **aResult);

#endif /* __nsContentPolicy_h__ */
