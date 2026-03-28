mkdir -Force components/scanner
mkdir -Force components/providers
mkdir -Force components/shared

mv components/analysis-findings.tsx components/scanner/
mv components/analysis-form.tsx components/scanner/
mv components/risk-indicator.tsx components/scanner/
mv components/scanner.tsx components/scanner/

mv components/auth-provider.tsx components/providers/
mv components/theme-provider.tsx components/providers/

mv components/language-switcher.tsx components/shared/
mv components/theme-toggle.tsx components/shared/

$files = Get-ChildItem -Path app,components -Recurse -Filter *.tsx

foreach ($file in $files) {
  $content = Get-Content $file.FullName
  $content = $content -replace "'@/components/analysis-findings'", "'@/components/scanner/analysis-findings'"
  $content = $content -replace "'@/components/analysis-form'", "'@/components/scanner/analysis-form'"
  $content = $content -replace "'@/components/risk-indicator'", "'@/components/scanner/risk-indicator'"
  $content = $content -replace "'@/components/scanner'", "'@/components/scanner/scanner'"
  $content = $content -replace "'@/components/auth-provider'", "'@/components/providers/auth-provider'"
  $content = $content -replace "'@/components/theme-provider'", "'@/components/providers/theme-provider'"
  $content = $content -replace "'@/components/language-switcher'", "'@/components/shared/language-switcher'"
  $content = $content -replace "'@/components/theme-toggle'", "'@/components/shared/theme-toggle'"
  Set-Content $file.FullName $content
}
