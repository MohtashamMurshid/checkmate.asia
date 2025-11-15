"use client";

import { MessageResponse } from "./message";

/**
 * Response component - wrapper around MessageResponse for compatibility
 * with AI Elements API
 */
export const Response = MessageResponse;

export type ResponseProps = Parameters<typeof MessageResponse>[0];

