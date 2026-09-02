"use client";

/**
 * Presence is rendered from the live/public Discord provider now.
 * This component intentionally does not overwrite the real status in the DOM.
 * Overriding it made LIVE/IDLE/DND/OFFLINE tracking appear broken.
 */
export default function AlwaysOnline(){return null;}
