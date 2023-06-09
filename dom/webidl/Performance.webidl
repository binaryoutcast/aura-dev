/* -*- Mode: IDL; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * The origin of this IDL file is
 * http://w3c.github.io/hr-time/
 *
 * Copyright © 2015 W3C® (MIT, ERCIM, Keio, Beihang).
 * W3C liability, trademark and document use rules apply.
 */

typedef double DOMHighResTimeStamp;
typedef sequence <PerformanceEntry> PerformanceEntryList;

[Exposed=(Window,Worker)]
interface Performance : EventTarget {
  [DependsOn=DeviceState, Affects=Nothing]
  DOMHighResTimeStamp now();

  [Constant]
  readonly attribute DOMHighResTimeStamp timeOrigin;
};

[Exposed=Window]
partial interface Performance {
  [Constant]
  readonly attribute PerformanceTiming timing;
  [Constant]
  readonly attribute PerformanceNavigation navigation;

  jsonifier;
};

// http://www.w3.org/TR/performance-timeline/#sec-window.performance-attribute
[Exposed=(Window,Worker)]
partial interface Performance {
  [Func="Performance::IsEnabled"]
  PerformanceEntryList getEntries();
  [Func="Performance::IsEnabled"]
  PerformanceEntryList getEntriesByType(DOMString entryType);
  [Func="Performance::IsEnabled"]
  PerformanceEntryList getEntriesByName(DOMString name, optional DOMString
    entryType);
};

// https://w3c.github.io/user-timing/#extensions-performance-interface
dictionary PerformanceMeasureOptions {
  any detail;
  (DOMString or DOMHighResTimeStamp) start;
  DOMHighResTimeStamp duration;
  (DOMString or DOMHighResTimeStamp)end;
};

// http://www.w3.org/TR/resource-timing/#extensions-performance-interface
[Exposed=Window]
partial interface Performance {
  [Func="Performance::IsEnabled"]
  void clearResourceTimings();
  [Func="Performance::IsEnabled"]
  void setResourceTimingBufferSize(unsigned long maxSize);
  [Func="Performance::IsEnabled"]
  attribute EventHandler onresourcetimingbufferfull;
};

#ifdef MOZ_DEVTOOLS_SERVER
// GC microbenchmarks, pref-guarded, not for general use (bug 1125412)
[Exposed=Window]
partial interface Performance {
  [Pref="dom.enable_memory_stats"]
  readonly attribute object mozMemory;
};
#endif

// https://w3c.github.io/user-timing/#extensions-performance-interface
dictionary PerformanceMarkOptions {
  any detail;
  DOMHighResTimeStamp startTime;
};

// http://www.w3.org/TR/user-timing/
[Exposed=(Window,Worker)]
partial interface Performance {
  [Func="Performance::IsEnabled", Throws]
  PerformanceMark mark(DOMString markName, optional PerformanceMarkOptions markOptions);
  [Func="Performance::IsEnabled"]
  void clearMarks(optional DOMString markName);
  [Func="Performance::IsEnabled", Throws]
  PerformanceMeasure measure(DOMString measureName,
                             optional (DOMString or PerformanceMeasureOptions) startOrMeasureOptions,
                             optional DOMString endMark);
  [Func="Performance::IsEnabled"]
  void clearMeasures(optional DOMString measureName);
};

