

import { socialMediaTools } from './tools/social-media';
import { webSearchTools } from './tools/web-search';
import { analysisTools } from './tools/analysis';
import { companyTools } from './tools/company';
import { visualizationTools } from './tools/visualization';

export const investigateTools = {
  ...socialMediaTools,
  ...webSearchTools,
  ...analysisTools,
  ...companyTools,
  ...visualizationTools,
};

