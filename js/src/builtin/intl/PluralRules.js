/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/********** Intl.PluralRules **********/

/**
 * PluralRules internal properties.
 *
 * Spec: ECMAScript 402 API, PluralRules, 1.3.3.
 */
var pluralRulesInternalProperties = {
    _availableLocales: null,
    availableLocales: function()
    {
        var locales = this._availableLocales;
        if (locales)
            return locales;

        locales = intl_PluralRules_availableLocales();
        addSpecialMissingLanguageTags(locales);
        return (this._availableLocales = locales);
    }
};

/**
 * Compute an internal properties object from |lazyPluralRulesData|.
 */
function resolvePluralRulesInternals(lazyPluralRulesData) {
    assert(IsObject(lazyPluralRulesData), "lazy data not an object?");

    var internalProps = std_Object_create(null);

    var requestedLocales = lazyPluralRulesData.requestedLocales;

    var PluralRules = pluralRulesInternalProperties;

    // Step 13.
    const r = ResolveLocale(callFunction(PluralRules.availableLocales, PluralRules),
                          lazyPluralRulesData.requestedLocales,
                          lazyPluralRulesData.opt,
                          noRelevantExtensionKeys, undefined);

    // Step 14.
    internalProps.locale = r.locale;
    internalProps.type = lazyPluralRulesData.type;

    internalProps.pluralCategories = intl_GetPluralCategories(
        internalProps.locale,
        internalProps.type);

    internalProps.minimumIntegerDigits = lazyPluralRulesData.minimumIntegerDigits;
    internalProps.minimumFractionDigits = lazyPluralRulesData.minimumFractionDigits;
    internalProps.maximumFractionDigits = lazyPluralRulesData.maximumFractionDigits;

    if ("minimumSignificantDigits" in lazyPluralRulesData) {
        assert("maximumSignificantDigits" in lazyPluralRulesData, "min/max sig digits mismatch");
        internalProps.minimumSignificantDigits = lazyPluralRulesData.minimumSignificantDigits;
        internalProps.maximumSignificantDigits = lazyPluralRulesData.maximumSignificantDigits;
    }

    return internalProps;
}

/**
 * Returns an object containing the PluralRules internal properties of |obj|,
 * or throws a TypeError if |obj| isn't PluralRules-initialized.
 */
function getPluralRulesInternals(obj, methodName) {
    var internals = getIntlObjectInternals(obj, "PluralRules", methodName);
    assert(internals.type === "PluralRules", "bad type escaped getIntlObjectInternals");

    var internalProps = maybeInternalProperties(internals);
    if (internalProps)
        return internalProps;

    internalProps = resolvePluralRulesInternals(internals.lazyData);
    setInternalProperties(internals, internalProps);
    return internalProps;
}

/**
 * Initializes an object as a PluralRules.
 *
 * This method is complicated a moderate bit by its implementing initialization
 * as a *lazy* concept.  Everything that must happen now, does -- but we defer
 * all the work we can until the object is actually used as a PluralRules.
 * This later work occurs in |resolvePluralRulesInternals|; steps not noted
 * here occur there.
 *
 * Spec: ECMAScript 402 API, PluralRules, 1.1.1.
 */
function InitializePluralRules(pluralRules, locales, options) {
    assert(IsObject(pluralRules), "InitializePluralRules");

    // Step 1.
    if (isInitializedIntlObject(pluralRules))
        ThrowTypeError(JSMSG_INTL_OBJECT_REINITED);

    let internals = initializeIntlObject(pluralRules);

    // Lazy PluralRules data has the following structure:
    //
    //   {
    //     requestedLocales: List of locales,
    //     type: "cardinal" / "ordinal",
    //
    //     opt: // opt object computer in InitializePluralRules
    //       {
    //         localeMatcher: "lookup" / "best fit",
    //       }
    //
    //     minimumIntegerDigits: integer ∈ [1, 21],
    //     minimumFractionDigits: integer ∈ [0, 20],
    //     maximumFractionDigits: integer ∈ [0, 20],
    //
    //     // optional
    //     minimumSignificantDigits: integer ∈ [1, 21],
    //     maximumSignificantDigits: integer ∈ [1, 21],
    //   }
    //
    // Note that lazy data is only installed as a final step of initialization,
    // so every PluralRules lazy data object has *all* these properties, never a
    // subset of them.
    const lazyPluralRulesData = std_Object_create(null);

    // Step 3.
    let requestedLocales = CanonicalizeLocaleList(locales);
    lazyPluralRulesData.requestedLocales = requestedLocales;

    // Steps 4-5.
    if (options === undefined)
        options = {};
    else
        options = ToObject(options);

    // Step 6.
    const type = GetOption(options, "type", "string", ["cardinal", "ordinal"], "cardinal");
    lazyPluralRulesData.type = type;

    // Step 8.
    let opt = new Record();
    lazyPluralRulesData.opt = opt;

    // Steps 9-10.
    let matcher = GetOption(options, "localeMatcher", "string", ["lookup", "best fit"], "best fit");
    opt.localeMatcher = matcher;


    // Step 11.
    SetNumberFormatDigitOptions(lazyPluralRulesData, options, 0);

    // Step 12.
    if (lazyPluralRulesData.maximumFractionDigits === undefined) {
        lazyPluralRulesData.maximumFractionDigits =
           std_Math_max(lazyPluralRulesData.minimumFractionDigits, 3);
    }

    setLazyData(internals, "PluralRules", lazyPluralRulesData)
}

/**
 * Returns the subset of the given locale list for which this locale list has a
 * matching (possibly fallback) locale. Locales appear in the same order in the
 * returned list as in the input list.
 *
 * Spec: ECMAScript 402 API, PluralRules, 1.3.2.
 */
function Intl_PluralRules_supportedLocalesOf(locales /*, options*/) {
    var options = arguments.length > 1 ? arguments[1] : undefined;

    // Step 1.
    var availableLocales = callFunction(pluralRulesInternalProperties.availableLocales,
                                        pluralRulesInternalProperties);
    // Step 2.
    let requestedLocales = CanonicalizeLocaleList(locales);

    // Step 3.
    return SupportedLocales(availableLocales, requestedLocales, options);
}

/**
 * Returns a String value representing the plural category matching
 * the number passed as value according to the
 * effective locale and the formatting options of this PluralRules.
 *
 * Spec: ECMAScript 402 API, PluralRules, 1.4.3.
 */
function Intl_PluralRules_select(value) {
    // Step 1.
    let pluralRules = this;
    // Step 2.
    let internals = getPluralRulesInternals(pluralRules, "select");

    // Steps 3-4.
    let n = ToNumber(value);

    // Step 5.
    return intl_SelectPluralRule(pluralRules, n);
}

/**
 * Returns the resolved options for a PluralRules object.
 *
 * Spec: ECMAScript 402 API, PluralRules, 1.4.4.
 */
function Intl_PluralRules_resolvedOptions() {
    var internals = getPluralRulesInternals(this, "resolvedOptions");

    var result = {
        locale: internals.locale,
        type: internals.type,
        pluralCategories: callFunction(std_Array_slice, internals.pluralCategories, 0),
        minimumIntegerDigits: internals.minimumIntegerDigits,
        minimumFractionDigits: internals.minimumFractionDigits,
        maximumFractionDigits: internals.maximumFractionDigits,
    };

    var optionalProperties = [
        "minimumSignificantDigits",
        "maximumSignificantDigits"
    ];

    for (var i = 0; i < optionalProperties.length; i++) {
        var p = optionalProperties[i];
        if (callFunction(std_Object_hasOwnProperty, internals, p))
            _DefineDataProperty(result, p, internals[p]);
    }
    return result;
}

