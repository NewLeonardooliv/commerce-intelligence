import type { EvalSummary, EvalResult } from './types';
import { writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Generate detailed HTML report from eval summary
 */
export async function generateHtmlReport(
  summary: EvalSummary,
  outputPath?: string
): Promise<string> {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agent Evals Report - ${new Date(summary.timestamp).toLocaleDateString()}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    
    .header .timestamp {
      opacity: 0.9;
      font-size: 0.9em;
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 40px;
      background: #f8f9fa;
    }
    
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .stat-card .label {
      color: #6c757d;
      font-size: 0.9em;
      margin-bottom: 8px;
    }
    
    .stat-card .value {
      font-size: 2em;
      font-weight: bold;
      color: #333;
    }
    
    .stat-card.success .value {
      color: #28a745;
    }
    
    .stat-card.danger .value {
      color: #dc3545;
    }
    
    .stat-card.info .value {
      color: #17a2b8;
    }
    
    .results {
      padding: 40px;
    }
    
    .results h2 {
      margin-bottom: 20px;
      color: #333;
    }
    
    .result-item {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      margin-bottom: 15px;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .result-item:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .result-header {
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      background: #f8f9fa;
    }
    
    .result-header.passed {
      border-left: 4px solid #28a745;
    }
    
    .result-header.failed {
      border-left: 4px solid #dc3545;
    }
    
    .result-title {
      font-weight: 600;
      color: #333;
    }
    
    .result-meta {
      display: flex;
      gap: 20px;
      align-items: center;
    }
    
    .badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
    }
    
    .badge.success {
      background: #d4edda;
      color: #155724;
    }
    
    .badge.danger {
      background: #f8d7da;
      color: #721c24;
    }
    
    .score {
      font-weight: bold;
      font-size: 1.1em;
    }
    
    .result-details {
      padding: 20px;
      display: none;
      border-top: 1px solid #dee2e6;
      background: white;
    }
    
    .result-item.expanded .result-details {
      display: block;
    }
    
    .detail-section {
      margin-bottom: 15px;
    }
    
    .detail-section h4 {
      color: #495057;
      margin-bottom: 8px;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .error-list, .warning-list {
      list-style: none;
      padding-left: 0;
    }
    
    .error-list li {
      padding: 8px 12px;
      background: #f8d7da;
      color: #721c24;
      border-radius: 4px;
      margin-bottom: 5px;
    }
    
    .warning-list li {
      padding: 8px 12px;
      background: #fff3cd;
      color: #856404;
      border-radius: 4px;
      margin-bottom: 5px;
    }
    
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
    }
    
    .metric-item {
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
      font-size: 0.9em;
    }
    
    .metric-label {
      color: #6c757d;
      font-size: 0.85em;
    }
    
    .metric-value {
      font-weight: 600;
      color: #333;
    }
    
    .footer {
      padding: 20px 40px;
      background: #f8f9fa;
      text-align: center;
      color: #6c757d;
      font-size: 0.9em;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .result-details {
        display: block !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 Agent Evaluation Report</h1>
      <div class="timestamp">Generated: ${new Date(summary.timestamp).toLocaleString('pt-BR')}</div>
    </div>
    
    <div class="stats">
      <div class="stat-card">
        <div class="label">Total Cases</div>
        <div class="value">${summary.totalCases}</div>
      </div>
      
      <div class="stat-card success">
        <div class="label">Passed</div>
        <div class="value">${summary.passed}</div>
      </div>
      
      <div class="stat-card danger">
        <div class="label">Failed</div>
        <div class="value">${summary.failed}</div>
      </div>
      
      <div class="stat-card info">
        <div class="label">Average Score</div>
        <div class="value">${(summary.averageScore * 100).toFixed(1)}%</div>
      </div>
      
      <div class="stat-card info">
        <div class="label">Avg Duration</div>
        <div class="value">${summary.averageDuration.toFixed(0)}ms</div>
      </div>
      
      <div class="stat-card ${summary.passed / summary.totalCases >= 0.8 ? 'success' : 'danger'}">
        <div class="label">Pass Rate</div>
        <div class="value">${((summary.passed / summary.totalCases) * 100).toFixed(1)}%</div>
      </div>
    </div>
    
    <div class="results">
      <h2>📊 Detailed Results</h2>
      ${summary.results
        .map(
          (result) => `
        <div class="result-item" onclick="this.classList.toggle('expanded')">
          <div class="result-header ${result.passed ? 'passed' : 'failed'}">
            <div class="result-title">
              ${result.passed ? '✅' : '❌'} ${result.caseName}
            </div>
            <div class="result-meta">
              <span class="badge ${result.passed ? 'success' : 'danger'}">
                ${result.passed ? 'PASSED' : 'FAILED'}
              </span>
              <span class="score">${(result.score * 100).toFixed(1)}%</span>
              <span class="duration">${result.duration}ms</span>
            </div>
          </div>
          
          <div class="result-details">
            ${
              result.errors.length > 0
                ? `
              <div class="detail-section">
                <h4>Errors</h4>
                <ul class="error-list">
                  ${result.errors.map((err) => `<li>${err}</li>`).join('')}
                </ul>
              </div>
            `
                : ''
            }
            
            ${
              result.warnings.length > 0
                ? `
              <div class="detail-section">
                <h4>Warnings</h4>
                <ul class="warning-list">
                  ${result.warnings.map((warn) => `<li>${warn}</li>`).join('')}
                </ul>
              </div>
            `
                : ''
            }
            
            ${
              result.metrics && Object.keys(result.metrics).length > 0
                ? `
              <div class="detail-section">
                <h4>Metrics</h4>
                <div class="metrics">
                  ${Object.entries(result.metrics)
                    .map(
                      ([key, value]) => `
                    <div class="metric-item">
                      <div class="metric-label">${key}</div>
                      <div class="metric-value">${typeof value === 'number' && value < 1 ? (value * 100).toFixed(1) + '%' : value}</div>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
                : ''
            }
          </div>
        </div>
      `
        )
        .join('')}
    </div>
    
    <div class="footer">
      <p>Commerce Intelligence - Agent Evaluation Framework</p>
      <p>Generated with ❤️ by the AI team</p>
    </div>
  </div>
  
  <script>
    // Results are interactive - click to expand/collapse
    console.log('Agent Eval Report loaded. Click on results to see details.');
  </script>
</body>
</html>
  `;

  if (outputPath) {
    await writeFile(outputPath, html, 'utf-8');
    console.log(`📄 HTML report saved to: ${outputPath}`);
  }

  return html;
}

/**
 * Generate JSON report from eval summary
 */
export async function generateJsonReport(
  summary: EvalSummary,
  outputPath?: string
): Promise<string> {
  const json = JSON.stringify(summary, null, 2);

  if (outputPath) {
    await writeFile(outputPath, json, 'utf-8');
    console.log(`📄 JSON report saved to: ${outputPath}`);
  }

  return json;
}

/**
 * Generate markdown report from eval summary
 */
export async function generateMarkdownReport(
  summary: EvalSummary,
  outputPath?: string
): Promise<string> {
  const passRate = (summary.passed / summary.totalCases) * 100;
  const passRateEmoji = passRate >= 80 ? '🟢' : passRate >= 60 ? '🟡' : '🔴';

  const markdown = `# Agent Evaluation Report

**Generated:** ${new Date(summary.timestamp).toLocaleString('pt-BR')}

## Summary

| Metric | Value |
|--------|-------|
| Total Cases | ${summary.totalCases} |
| Passed | ${summary.passed} ✅ |
| Failed | ${summary.failed} ❌ |
| Average Score | ${(summary.averageScore * 100).toFixed(1)}% |
| Average Duration | ${summary.averageDuration.toFixed(0)}ms |
| Pass Rate | ${passRate.toFixed(1)}% ${passRateEmoji} |

## Detailed Results

${summary.results
  .map(
    (result) => `
### ${result.passed ? '✅' : '❌'} ${result.caseName}

- **ID:** \`${result.caseId}\`
- **Score:** ${(result.score * 100).toFixed(1)}%
- **Duration:** ${result.duration}ms
- **Status:** ${result.passed ? '**PASSED**' : '**FAILED**'}

${
  result.errors.length > 0
    ? `
**Errors:**
${result.errors.map((err) => `- ❌ ${err}`).join('\n')}
`
    : ''
}

${
  result.warnings.length > 0
    ? `
**Warnings:**
${result.warnings.map((warn) => `- ⚠️ ${warn}`).join('\n')}
`
    : ''
}

${
  result.metrics && Object.keys(result.metrics).length > 0
    ? `
**Metrics:**
${Object.entries(result.metrics)
  .map(([key, value]) => `- **${key}:** ${typeof value === 'number' && value < 1 ? (value * 100).toFixed(1) + '%' : value}`)
  .join('\n')}
`
    : ''
}
`
  )
  .join('\n---\n')}

## Recommendations

${passRate >= 80 ? '✅ Excellent! The agents are performing well.' : ''}
${passRate >= 60 && passRate < 80 ? '⚠️ Good, but there is room for improvement. Review failed cases.' : ''}
${passRate < 60 ? '❌ Attention needed! Many cases are failing. Review the implementation.' : ''}

${summary.errors.length > 0 ? `\n### Common Errors\n\n${summary.errors.slice(0, 5).map((err) => `- ${err}`).join('\n')}\n` : ''}

---

*Generated by Commerce Intelligence - Agent Evaluation Framework*
`;

  if (outputPath) {
    await writeFile(outputPath, markdown, 'utf-8');
    console.log(`📄 Markdown report saved to: ${outputPath}`);
  }

  return markdown;
}

/**
 * Compare two eval summaries and generate diff report
 */
export function compareEvalSummaries(
  baseline: EvalSummary,
  current: EvalSummary
): {
  scoreChange: number;
  passRateChange: number;
  durationChange: number;
  newFailures: string[];
  newPasses: string[];
  regressions: EvalResult[];
  improvements: EvalResult[];
} {
  const baselinePassRate = baseline.passed / baseline.totalCases;
  const currentPassRate = current.passed / current.totalCases;

  const baselineResultsMap = new Map(baseline.results.map((r) => [r.caseId, r]));
  const currentResultsMap = new Map(current.results.map((r) => [r.caseId, r]));

  const newFailures: string[] = [];
  const newPasses: string[] = [];
  const regressions: EvalResult[] = [];
  const improvements: EvalResult[] = [];

  for (const [caseId, currentResult] of currentResultsMap) {
    const baselineResult = baselineResultsMap.get(caseId);

    if (baselineResult) {
      // Case existed in both
      if (baselineResult.passed && !currentResult.passed) {
        newFailures.push(caseId);
      } else if (!baselineResult.passed && currentResult.passed) {
        newPasses.push(caseId);
      }

      // Check for score regression/improvement
      const scoreDiff = currentResult.score - baselineResult.score;
      if (scoreDiff < -0.1) {
        regressions.push(currentResult);
      } else if (scoreDiff > 0.1) {
        improvements.push(currentResult);
      }
    }
  }

  return {
    scoreChange: current.averageScore - baseline.averageScore,
    passRateChange: currentPassRate - baselinePassRate,
    durationChange: current.averageDuration - baseline.averageDuration,
    newFailures,
    newPasses,
    regressions,
    improvements,
  };
}
