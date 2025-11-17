

import { socialMediaTools } from './tools/social-media';
import { webSearchTools } from './tools/web-search';
import { analysisTools } from './tools/analysis';
import { companyTools } from './tools/company';
import { visualizationTools } from './tools/visualization';
import { businessTools } from './tools/business';
import { financeTools } from './tools/finance';
import { scienceTools } from './tools/science';
import { factualTools } from './tools/factual';
import { historyTools } from './tools/history';

export const investigateTools = {
  ...socialMediaTools,
  ...webSearchTools,
  ...analysisTools,
  ...companyTools,
  ...visualizationTools,
  ...businessTools,
  ...financeTools,
  ...scienceTools,
  ...factualTools,
  ...historyTools,
};

