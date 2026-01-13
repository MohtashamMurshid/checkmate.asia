/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auditLog from "../auditLog.js";
import type * as briefs from "../briefs.js";
import type * as contacts from "../contacts.js";
import type * as datasetAnalyses from "../datasetAnalyses.js";
import type * as investigations from "../investigations.js";
import type * as portfolio from "../portfolio.js";
import type * as seed from "../seed.js";
import type * as signals from "../signals.js";
import type * as signalsData from "../signalsData.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auditLog: typeof auditLog;
  briefs: typeof briefs;
  contacts: typeof contacts;
  datasetAnalyses: typeof datasetAnalyses;
  investigations: typeof investigations;
  portfolio: typeof portfolio;
  seed: typeof seed;
  signals: typeof signals;
  signalsData: typeof signalsData;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
