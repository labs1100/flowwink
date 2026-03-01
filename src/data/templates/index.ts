/**
 * Template Registry
 * 
 * Central index that aggregates all starter templates.
 * To add a new template, create a file in this directory and add it to the array below.
 * 
 * See templates/README.md for contribution guidelines.
 * See docs/TEMPLATE-AUTHORING.md for block reference.
 */

export { launchpadTemplate } from './launchpad';
export { momentumTemplate } from './momentum';
export { trustcorpTemplate } from './trustcorp';
export { securehealthTemplate } from './securehealth';
export { flowwinkPlatformTemplate } from './flowwink-platform';
export { helpCenterTemplate } from './helpcenter';
export { serviceProTemplate } from './service-pro';
export { digitalShopTemplate } from './digital-shop';
export { flowwinkAgencyTemplate } from './flowwink-agency';
export { BLANK_TEMPLATE } from './blank';

import { launchpadTemplate } from './launchpad';
import { momentumTemplate } from './momentum';
import { trustcorpTemplate } from './trustcorp';
import { securehealthTemplate } from './securehealth';
import { flowwinkPlatformTemplate } from './flowwink-platform';
import { helpCenterTemplate } from './helpcenter';
import { serviceProTemplate } from './service-pro';
import { digitalShopTemplate } from './digital-shop';
import { flowwinkAgencyTemplate } from './flowwink-agency';

import type { StarterTemplate } from './types';

/**
 * All available starter templates.
 * Order matters — this is the display order in the template gallery.
 */
export const ALL_TEMPLATES: StarterTemplate[] = [
  launchpadTemplate,
  momentumTemplate,
  trustcorpTemplate,
  securehealthTemplate,
  flowwinkPlatformTemplate,
  helpCenterTemplate,
  serviceProTemplate,
  digitalShopTemplate,
  flowwinkAgencyTemplate,
];
