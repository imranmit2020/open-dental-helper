// Firecrawl is dynamically imported to avoid bundling Node/CJS code in the browser

interface ErrorResponse {
  success: false;
  error: string;
}

interface CrawlStatusResponse {
  success: true;
  status: string;
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: string;
  data: any[];
}

type CrawlResponse = CrawlStatusResponse | ErrorResponse;

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static firecrawlApp: any | null = null;
  private static firecrawlModulePromise: Promise<any> | null = null;

  private static async getFirecrawlApp(apiKey: string) {
    if (!this.firecrawlModulePromise) {
      this.firecrawlModulePromise = import('@mendable/firecrawl-js');
    }
    const mod = await this.firecrawlModulePromise;
    const FirecrawlApp = mod.default ?? mod.FirecrawlApp;
    return new FirecrawlApp({ apiKey });
  }

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.getFirecrawlApp(apiKey)
      .then(app => { this.firecrawlApp = app; })
      .catch(console.error);
    console.log('API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing API key with Firecrawl API');
      this.firecrawlApp = await this.getFirecrawlApp(apiKey);
      // A simple test crawl to verify the API key
      const testResponse = await this.firecrawlApp.crawlUrl('https://example.com', {
        limit: 1
      });
      return testResponse.success;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }

  static async crawlDentalResearch(query: string): Promise<{ success: boolean; error?: string; data?: any }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      console.log('Crawling dental research for:', query);
      if (!this.firecrawlApp) {
        this.firecrawlApp = await this.getFirecrawlApp(apiKey);
      }

      // Search dental research websites
      const dentalSites = [
        'https://www.ncbi.nlm.nih.gov/pubmed',
        'https://www.jada.ada.org',
        'https://www.dentalcare.com',
        'https://www.aegisdentalnetwork.com'
      ];

      const results = [];
      for (const site of dentalSites.slice(0, 2)) { // Limit to 2 sites for demo
        try {
          const crawlResponse = await this.firecrawlApp.crawlUrl(site, {
            limit: 10,
            scrapeOptions: {
              formats: ['markdown'],
            }
          }) as CrawlResponse;

          if (crawlResponse.success) {
            results.push({
              site,
              data: crawlResponse.data
            });
          }
        } catch (error) {
          console.warn(`Failed to crawl ${site}:`, error);
        }
      }

      return { 
        success: true,
        data: results 
      };
    } catch (error) {
      console.error('Error during dental research crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to crawl dental research' 
      };
    }
  }

  static async crawlWebsite(url: string): Promise<{ success: boolean; error?: string; data?: any }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      console.log('Making crawl request to Firecrawl API');
      if (!this.firecrawlApp) {
        this.firecrawlApp = await this.getFirecrawlApp(apiKey);
      }

      const crawlResponse = await this.firecrawlApp.crawlUrl(url, {
        limit: 100,
        scrapeOptions: {
          formats: ['markdown', 'html'],
        }
      }) as CrawlResponse;

      if (!crawlResponse.success) {
        console.error('Crawl failed:', (crawlResponse as ErrorResponse).error);
        return { 
          success: false, 
          error: (crawlResponse as ErrorResponse).error || 'Failed to crawl website' 
        };
      }

      console.log('Crawl successful:', crawlResponse);
      return { 
        success: true,
        data: crawlResponse 
      };
    } catch (error) {
      console.error('Error during crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }
}