# Graph Report - .  (2026-05-06)

## Corpus Check
- 135 files · ~123,758 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 506 nodes · 449 edges · 25 communities detected
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Calculatekpisummary|Calculatekpisummary]]
- [[_COMMUNITY_Filternavitem|Filternavitem]]
- [[_COMMUNITY_Generateavatarurl|Generateavatarurl]]
- [[_COMMUNITY_Calculatevisitsummary|Calculatevisitsummary]]
- [[_COMMUNITY_Aggregated2Ctosf|Aggregated2Ctosf]]
- [[_COMMUNITY_Buildperformancetablerows|Buildperformancetablerows]]
- [[_COMMUNITY_Getstatusbadge|Getstatusbadge]]
- [[_COMMUNITY_Formatnumber|Formatnumber]]
- [[_COMMUNITY_Avgfield|Avgfield]]
- [[_COMMUNITY_Clearcustomrange|Clearcustomrange]]
- [[_COMMUNITY_Clearvalidities|Clearvalidities]]
- [[_COMMUNITY_Handlechange|Handlechange]]
- [[_COMMUNITY_Formatdate|Formatdate]]
- [[_COMMUNITY_Calculatetotalrow|Calculatetotalrow]]
- [[_COMMUNITY_Generateaktifasidata|Generateaktifasidata]]
- [[_COMMUNITY_Handleimageremove|Handleimageremove]]
- [[_COMMUNITY_Usesidebar|Usesidebar]]
- [[_COMMUNITY_Generatecitydata|Generatecitydata]]
- [[_COMMUNITY_Createdefaultfilterstate|Createdefaultfilterstate]]
- [[_COMMUNITY_Apifetch|Apifetch]]
- [[_COMMUNITY_Generatecvmmetric|Generatecvmmetric]]
- [[_COMMUNITY_Generateproductmetric|Generateproductmetric]]
- [[_COMMUNITY_Excelexport Ts|Excelexport Ts]]
- [[_COMMUNITY_Usesearch|Usesearch]]
- [[_COMMUNITY_Getstatusbadge|Getstatusbadge]]

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 7 edges
2. `generateMockVisits()` - 6 edges
3. `generateSingleOutlet()` - 5 edges
4. `buildDashboardViewModel()` - 5 edges
5. `sumField()` - 4 edges
6. `avgField()` - 4 edges
7. `generate5SRow()` - 4 edges
8. `generate4RRow()` - 4 edges
9. `useRoleCheck()` - 3 edges
10. `getMaxDays()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `ProfileEditModal()` --calls--> `useAuth()`  [INFERRED]
  src\components\modals\ProfileEditModal.tsx → src\contexts\AuthContext.tsx
- `useHasFullAccess()` --calls--> `useAuth()`  [INFERRED]
  src\hooks\useRoleBasedData.ts → src\contexts\AuthContext.tsx
- `useRoleBasedSalesforce()` --calls--> `useAuth()`  [INFERRED]
  src\hooks\useRoleBasedData.ts → src\contexts\AuthContext.tsx
- `buildDashboardViewModel()` --calls--> `getOutletDistributionByPJP()`  [INFERRED]
  src\utils\dashboardFilterMock.ts → src\data\mockData.ts
- `buildDashboardViewModel()` --calls--> `getSalesTrend()`  [INFERRED]
  src\utils\dashboardFilterMock.ts → src\data\mockData.ts

## Communities

### Community 0 - "Calculatekpisummary"
Cohesion: 0.08
Nodes (6): calculateKPISummary(), getOutletDistributionByPJP(), getSalesTrend(), calcGrowth(), buildDashboardViewModel(), monthsBetween()

### Community 1 - "Filternavitem"
Cohesion: 0.12
Nodes (11): filterNavItem(), useAuth(), useRoleCheck(), useHasFullAccess(), useRoleBasedOutlets(), useRoleBasedSalesforce(), useUserFilterContext(), ProfileEditModal() (+3 more)

### Community 2 - "Generateavatarurl"
Cohesion: 0.14
Nodes (5): generateId(), generateSingleOutlet(), getKabupatenForTAP(), randomElement(), randomInt()

### Community 3 - "Calculatevisitsummary"
Cohesion: 0.18
Nodes (7): calculateVisitSummary(), generateCoords(), generateMockVisits(), generateRandomTime(), getRandomItem(), getRandomStatus(), loadData()

### Community 4 - "Aggregated2Ctosf"
Cohesion: 0.18
Nodes (3): createD2CMetric(), createMetric(), randomInt()

### Community 5 - "Buildperformancetablerows"
Cohesion: 0.21
Nodes (5): filterValuesByCategory(), generateId(), generateKPIValue(), getParametersByCategory(), randomInt()

### Community 9 - "Getstatusbadge"
Cohesion: 0.24
Nodes (5): getStatusBadge(), getStatusIcon(), handleDrop(), handleFile(), handleInputChange()

### Community 10 - "Formatnumber"
Cohesion: 0.2
Nodes (2): getTotalColSpan(), getProductHeaderBg()

### Community 11 - "Avgfield"
Cohesion: 0.44
Nodes (9): avgField(), generate4RData(), generate4RRow(), generate5SData(), generate5SRow(), randomFloat(), randomInt(), randomPct() (+1 more)

### Community 12 - "Clearcustomrange"
Cohesion: 0.32
Nodes (3): getMaxDays(), handleRangeEndChange(), handleRangeStartChange()

### Community 13 - "Clearvalidities"
Cohesion: 0.32
Nodes (3): getMaxDays(), handleRangeEndChange(), handleRangeStartChange()

### Community 20 - "Handlechange"
Cohesion: 0.33
Nodes (2): handleSaveLookerUrl(), isAllowedLookerUrl()

### Community 22 - "Formatdate"
Cohesion: 0.38
Nodes (3): getExpiryStatus(), isExpired(), isExpiringSoon()

### Community 23 - "Calculatetotalrow"
Cohesion: 0.38
Nodes (3): generateMetric(), generateRowMetrics(), randomInt()

### Community 24 - "Generateaktifasidata"
Cohesion: 0.43
Nodes (5): generateAktifasiData(), generateAreaSummaries(), generateMetricSet(), randomFloat(), sumMetricSet()

### Community 29 - "Handleimageremove"
Cohesion: 0.5
Nodes (2): handleSubmit(), validate()

### Community 31 - "Usesidebar"
Cohesion: 0.4
Nodes (2): useSidebar(), AppLayout()

### Community 37 - "Generatecitydata"
Cohesion: 0.5
Nodes (2): generateTrendData(), randomFloat()

### Community 40 - "Createdefaultfilterstate"
Cohesion: 0.67
Nodes (2): createDefaultFilterState(), getDefaultDateRange()

### Community 45 - "Apifetch"
Cohesion: 0.83
Nodes (3): apiFetch(), getApiBaseUrl(), trimSlash()

### Community 46 - "Generatecvmmetric"
Cohesion: 0.67
Nodes (2): generateCVMMetric(), randomInt()

### Community 47 - "Generateproductmetric"
Cohesion: 0.67
Nodes (2): generateProductMetric(), randomInt()

### Community 49 - "Excelexport Ts"
Cohesion: 0.83
Nodes (3): exportD2CSummary(), exportDetailOutlet(), exportToExcel()

### Community 54 - "Usesearch"
Cohesion: 1.0
Nodes (2): useSearch(), useSearchFilter()

### Community 59 - "Getstatusbadge"
Cohesion: 1.0
Nodes (2): getStatusBadge(), getTypeBadge()

## Knowledge Gaps
- **Thin community `Formatnumber`** (10 nodes): `formatNumber()`, `getPrevMonthValue()`, `getTotalColSpan()`, `PlanVoucherPage.tsx`, `brandColors.ts`, `getBrandColors()`, `getProductCellBg()`, `getProductHeaderBg()`, `getProductSubHeaderBg()`, `getProductTargetBg()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Handlechange`** (7 nodes): `handleChange()`, `handleResetLookerUrl()`, `handleSave()`, `handleSaveLookerUrl()`, `isAllowedLookerUrl()`, `testConnection()`, `SettingsPage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Handleimageremove`** (5 nodes): `handleImageRemove()`, `handleImageSelect()`, `handleSubmit()`, `validate()`, `POPInstallationForm.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Usesidebar`** (5 nodes): `useSidebar()`, `AppLayout()`, `App.tsx`, `SidebarContext.tsx`, `main.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Generatecitydata`** (5 nodes): `generateCityData()`, `generateKecamatanData()`, `generateTrendData()`, `randomFloat()`, `marketShareData.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Createdefaultfilterstate`** (4 nodes): `createDefaultFilterState()`, `getDefaultDateRange()`, `handleReset()`, `FilterBar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Generatecvmmetric`** (4 nodes): `generateCVMMetric()`, `generateCVMSalesData()`, `randomInt()`, `cvmSalesData.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Generateproductmetric`** (4 nodes): `generateProductMetric()`, `generateVoucherSalesData()`, `randomInt()`, `voucherSalesData.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Usesearch`** (3 nodes): `useSearch()`, `useSearchFilter()`, `SearchContext.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Getstatusbadge`** (3 nodes): `getStatusBadge()`, `getTypeBadge()`, `ProgramPage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 6 inferred relationships involving `useAuth()` (e.g. with `useRoleCheck()` and `ProfileEditModal()`) actually correct?**
  _`useAuth()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `buildDashboardViewModel()` (e.g. with `calculateKPISummary()` and `getOutletDistributionByPJP()`) actually correct?**
  _`buildDashboardViewModel()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `Calculatekpisummary` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Filternavitem` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Generateavatarurl` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._