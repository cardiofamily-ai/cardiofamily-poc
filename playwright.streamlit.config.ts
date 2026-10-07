import { defineConfig, devices } from '@playwright/test'

/**
 * Checks the Streamlit-hosted deployment: CardioFamily (the committed
 * streamlit_dist/cardiofamily.html) running inside `streamlit run streamlit_app.py`.
 * Requires Python with `pip install -r requirements.txt`, plus
 * `npx playwright install chromium`.
 */
export default defineConfig({
  testDir: './e2e-streamlit',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:8502', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: 'python3 -m streamlit run streamlit_app.py --server.port 8502 --server.headless true',
    url: 'http://localhost:8502/_stcore/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
