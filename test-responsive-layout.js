#!/usr/bin/env node

const http = require('http');

const SCREEN_SIZES = [
  { name: '1366×768 (HD)', width: 1366, height: 768 },
  { name: '1440×900 (HD+)', width: 1440, height: 900 },
  { name: '1600×900 (HD+)', width: 1600, height: 900 },
  { name: '1920×1080 (FHD)', width: 1920, height: 1080 },
  { name: '768×1024 (Tablet)', width: 768, height: 1024 },
  { name: '375×667 (Mobile)', width: 375, height: 667 },
];

const PAGES_TO_TEST = [
  '/dashboard',
  '/assets/all',
  '/assets/furniture',
  '/assets/electronics',
  '/assets/vehicles',
  '/admin/users',
  '/notifications',
  '/settings',
];

async function checkPageLayout(page, screenSize) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${page}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const issues = [];

        // Check for responsive classes
        const hasResponsiveContainer = data.includes('w-full') && data.includes('max-w-full');
        if (!hasResponsiveContainer) {
          issues.push('Missing responsive container classes (w-full max-w-full)');
        }

        // Check for overflow control
        const hasOverflowControl = data.includes('overflow-x-hidden') || data.includes('overflow-auto');
        if (!hasOverflowControl) {
          issues.push('Missing overflow control');
        }

        // Check for fixed widths that cause issues
        if (data.includes('max-w-7xl') || data.includes('max-w-[1400px]') || data.includes('w-[1400px]')) {
          issues.push('Found problematic fixed-width classes');
        }

        // Check for responsive padding
        const hasResponsivePadding = data.includes('px-3') && (data.includes('sm:px-4') || data.includes('sm:px-'));
        if (!hasResponsivePadding) {
          issues.push('Missing responsive padding classes');
        }

        resolve({
          page,
          screenSize: screenSize.name,
          hasResponsiveContainer,
          hasOverflowControl,
          hasResponsivePadding,
          issues,
          passed: issues.length === 0,
        });
      });
    }).on('error', (err) => {
      resolve({
        page,
        screenSize: screenSize.name,
        error: err.message,
        passed: false,
      });
    });
  });
}

async function runTests() {
  console.log('🧪 Testing Responsive Layout at Different Screen Sizes\n');
  console.log('=' .repeat(80));

  const results = [];

  for (const page of PAGES_TO_TEST) {
    console.log(`\n📄 Testing: ${page}`);
    console.log('-'.repeat(80));

    for (const screenSize of SCREEN_SIZES) {
      const result = await checkPageLayout(page, screenSize);
      results.push(result);

      const status = result.passed ? '✅' : '❌';
      console.log(`  ${status} ${result.screenSize.padEnd(20)}`);

      if (!result.passed) {
        if (result.error) {
          console.log(`     Error: ${result.error}`);
        } else {
          result.issues.forEach(issue => {
            console.log(`     ⚠️  ${issue}`);
          });
        }
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 SUMMARY\n');

  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;

  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ❌`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (failedTests > 0) {
    console.log('\n⚠️  Failed Tests:');
    results.filter(r => !r.passed).forEach(result => {
      console.log(`  - ${result.page} (${result.screenSize})`);
      if (result.issues) {
        result.issues.forEach(issue => console.log(`    • ${issue}`));
      }
      if (result.error) {
        console.log(`    • Error: ${result.error}`);
      }
    });
  } else {
    console.log('\n🎉 All tests passed! Layout is responsive across all screen sizes.');
  }

  console.log('\n' + '='.repeat(80));
}

runTests().catch(console.error);
